import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  specialization: { type: String, required: true, trim: true, maxlength: 120 },
  licenseNumber: { type: String, trim: true, maxlength: 100, default: '' },
  consultationFee: { type: Number, min: 0, default: 0 },
  availability: [{ day: String, startTime: String, endTime: String }],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Doctor', schema);
