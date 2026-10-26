import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'receptionist'], default: 'patient', required: true },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ role: 1, name: 1 });
export default mongoose.model('User', userSchema);
