import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  reason: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reminderSentAt: { type: Date, default: null }
}, { timestamps: true });

schema.index({ doctor: 1, startAt: 1, endAt: 1, status: 1 });
schema.index({ patient: 1, startAt: -1 });
export default mongoose.model('Appointment', schema);
