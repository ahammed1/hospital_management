import { Router } from 'express';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/', allowRoles('admin', 'doctor', 'receptionist'), asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('name email phone createdAt').sort({ createdAt: -1 }).limit(500);
  res.json(patients);
}));
router.post('/', allowRoles('admin', 'receptionist'), asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and temporary password are required.' });
  if (password.length < 12) return res.status(400).json({ message: 'Password must be at least 12 characters.' });
  const user = await User.create({ name, email, phone, role: 'patient', passwordHash: await (await import('bcryptjs')).default.hash(password, 12) });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
}));
export default router;
