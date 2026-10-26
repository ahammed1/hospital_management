import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  const now = new Date();
  const base = {};
  if (req.user.role === 'patient') base.patient = req.user._id;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) base.doctor = doctor._id;
    else return res.json({ stats: [], upcoming: [] });
  }
  const [patients, doctors, departments, appointments, upcoming] = await Promise.all([
    ['admin', 'receptionist'].includes(req.user.role) ? User.countDocuments({ role: 'patient' }) : Promise.resolve(null),
    ['admin', 'receptionist'].includes(req.user.role) ? Doctor.countDocuments({ isAvailable: true }) : Promise.resolve(null),
    req.user.role === 'admin' ? Department.countDocuments({ isActive: true }) : Promise.resolve(null),
    Appointment.countDocuments({ ...base, startAt: { $gte: now }, status: { $in: ['scheduled', 'confirmed'] } }),
    Appointment.find({ ...base, startAt: { $gte: now }, status: { $in: ['scheduled', 'confirmed'] } }).sort({ startAt: 1 }).limit(6)
      .populate('patient', 'name').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).populate('department', 'name')
  ]);
  const stats = [
    ...(patients !== null ? [{ label: 'Registered patients', value: patients, icon: 'users' }] : []),
    ...(doctors !== null ? [{ label: 'Available doctors', value: doctors, icon: 'stethoscope' }] : []),
    ...(departments !== null ? [{ label: 'Departments', value: departments, icon: 'building' }] : []),
    { label: 'Upcoming appointments', value: appointments, icon: 'calendar' }
  ];
  res.json({ stats, upcoming });
}));
export default router;
