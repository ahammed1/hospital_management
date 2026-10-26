import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/email.js';

const router = Router();
router.use(authenticate);

const populateAppointment = query => query
  .populate('patient', 'name email phone')
  .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name email' }, { path: 'department', select: 'name' }] })
  .populate('department', 'name');

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'patient') filter.patient = req.user._id;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.json([]);
    filter.doctor = doctor._id;
  }
  const appointments = await populateAppointment(Appointment.find(filter).sort({ startAt: -1 }).limit(500));
  res.json(appointments);
}));

router.post('/', allowRoles('admin', 'receptionist', 'patient'), asyncHandler(async (req, res) => {
  const { doctorId, startAt, endAt, reason } = req.body;
  const start = new Date(startAt), end = new Date(endAt);
  if (!doctorId || !startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start <= new Date() || end <= start) {
    return res.status(400).json({ message: 'Choose a doctor and a valid future time range.' });
  }
  const doctor = await Doctor.findById(doctorId).populate('department');
  if (!doctor || !doctor.isAvailable) return res.status(404).json({ message: 'Doctor is unavailable.' });
  let patientId = req.body.patientId;
  if (req.user.role === 'patient') patientId = req.user._id;
  if (!patientId || !(await User.exists({ _id: patientId, role: 'patient', isActive: true }))) return res.status(400).json({ message: 'Choose a valid patient.' });
  const conflict = await Appointment.exists({
    doctor: doctor._id,
    status: { $in: ['scheduled', 'confirmed'] },
    startAt: { $lt: end },
    endAt: { $gt: start }
  });
  if (conflict) return res.status(409).json({ message: 'This doctor already has an appointment during that time. Choose another slot.' });
  const appointment = await Appointment.create({
    patient: patientId, doctor: doctor._id, department: doctor.department?._id || null,
    startAt: start, endAt: end, reason, createdBy: req.user._id
  });
  const populated = await populateAppointment(Appointment.findById(appointment._id));
  try {
    const patient = await User.findById(patientId);
    if (patient?.email) await sendEmail({ to: patient.email, subject: 'MediCore appointment booked', text: `Your appointment is booked for ${start.toLocaleString()}.` });
  } catch (err) { console.error('Appointment email failed:', err.message); }
  res.status(201).json(populated);
}));

router.patch('/:id/status', allowRoles('admin', 'receptionist', 'doctor'), asyncHandler(async (req, res) => {
  const allowed = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid appointment status.' });
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || !appointment.doctor.equals(doctor._id)) return res.status(403).json({ message: 'You can only update your own appointments.' });
  }
  appointment.status = req.body.status;
  await appointment.save();
  res.json(await populateAppointment(Appointment.findById(appointment._id)));
}));
export default router;
