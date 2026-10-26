import { Router } from 'express';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import bcrypt from 'bcryptjs';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().populate('user', 'name email phone').populate('department', 'name').sort({ createdAt: -1 });
  res.json(doctors);
}));
router.post('/', allowRoles('admin'), asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialization, department, consultationFee, licenseNumber } = req.body;
  if (!name || !email || !password || !specialization) return res.status(400).json({ message: 'Name, email, temporary password, and specialization are required.' });
  if (password.length < 12) return res.status(400).json({ message: 'Temporary password must be at least 12 characters.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already exists.' });
  if (department && !(await Department.exists({ _id: department }))) return res.status(400).json({ message: 'Department not found.' });
  const user = await User.create({ name, email, phone, role: 'doctor', passwordHash: await bcrypt.hash(password, 12) });
  try {
    const doctor = await Doctor.create({ user: user._id, specialization, department: department || null, consultationFee: Number(consultationFee || 0), licenseNumber });
    res.status(201).json(await doctor.populate([{ path: 'user', select: 'name email phone' }, { path: 'department', select: 'name' }]));
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
}));
export default router;
