import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  diagnosis: { type: String, required: true, trim: true, maxlength: 3000 },
  symptoms: { type: String, trim: true, maxlength: 3000, default: '' },
  notes: { type: String, trim: true, maxlength: 5000, default: '' },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

schema.index({ patient: 1, recordedAt: -1 });
export default mongoose.model('MedicalRecord', schema);
