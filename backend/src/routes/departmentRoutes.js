import { Router } from 'express';
import Department from '../models/Department.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => res.json(await Department.find().sort({ name: 1 }))));
router.post('/', allowRoles('admin'), asyncHandler(async (req, res) => {
  const { name, description, location } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Department name is required.' });
  res.status(201).json(await Department.create({ name: name.trim(), description, location }));
}));
export default router;
