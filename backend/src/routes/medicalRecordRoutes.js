import { Router } from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import Doctor from '../models/Doctor.js';
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
  res.json(await MedicalRecord.find(filter).populate('patient', 'name email').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).sort({ recordedAt: -1 }).limit(500));
}));
router.post('/', allowRoles('admin', 'doctor'), asyncHandler(async (req, res) => {
  const { patientId, diagnosis, symptoms, notes, appointmentId } = req.body;
  if (!patientId || !diagnosis?.trim()) return res.status(400).json({ message: 'Patient and diagnosis are required.' });
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (req.user.role === 'doctor' && !doctor) return res.status(403).json({ message: 'Doctor profile is missing.' });
  if (req.user.role === 'admin' && !req.body.doctorId && !doctor) return res.status(400).json({ message: 'Doctor profile ID is required for admin-created records.' });
  const doctorId = req.user.role === 'doctor' ? doctor._id : req.body.doctorId;
  res.status(201).json(await MedicalRecord.create({ patient: patientId, doctor: doctorId, diagnosis, symptoms, notes, appointment: appointmentId || null }));
}));
export default router;
