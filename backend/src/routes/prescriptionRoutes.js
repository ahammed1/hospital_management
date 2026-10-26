import { Router } from 'express';
import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'patient') filter.patient = req.user._id;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.json([]);
    filter.doctor = doctor._id;
  }
  res.json(await Prescription.find(filter)
    .populate('patient', 'name email')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort({ issuedAt: -1 }).limit(500));
}));

router.post('/', allowRoles('doctor', 'admin'), asyncHandler(async (req, res) => {
  const { patientId, items, notes, appointmentId } = req.body;
  if (!patientId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Patient and at least one medicine are required.' });
  }

  if (!(await User.exists({ _id: patientId, role: 'patient', isActive: true }))) {
    return res.status(400).json({ message: 'Choose an active patient account.' });
  }

  let doctorId;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(403).json({ message: 'Doctor profile is missing.' });
    doctorId = doctor._id;
  } else {
    doctorId = req.body.doctorId;
    if (!doctorId || !(await Doctor.exists({ _id: doctorId }))) {
      return res.status(400).json({ message: 'Choose a valid doctor profile.' });
    }
  }

  res.status(201).json(await Prescription.create({
    patient: patientId,
    doctor: doctorId,
    items,
    notes,
    appointment: appointmentId || null
  }));
}));

export default router;
