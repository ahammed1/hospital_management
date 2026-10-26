import { Router } from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
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
  res.json(await MedicalRecord.find(filter)
    .populate('patient', 'name email')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort({ recordedAt: -1 }).limit(500));
}));

router.post('/', allowRoles('admin', 'doctor'), asyncHandler(async (req, res) => {
  const { patientId, diagnosis, symptoms, notes, appointmentId } = req.body;
  if (!patientId || !diagnosis?.trim()) {
    return res.status(400).json({ message: 'Patient and diagnosis are required.' });
  }

  const patientExists = await User.exists({ _id: patientId, role: 'patient', isActive: true });
  if (!patientExists) return res.status(400).json({ message: 'Choose an active patient account.' });

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

  res.status(201).json(await MedicalRecord.create({
    patient: patientId,
    doctor: doctorId,
    diagnosis: diagnosis.trim(),
    symptoms,
    notes,
    appointment: appointmentId || null
  }));
}));

export default router;
