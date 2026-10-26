import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  medicine: { type: String, required: true, trim: true, maxlength: 200 },
  dosage: { type: String, required: true, trim: true, maxlength: 100 },
  frequency: { type: String, required: true, trim: true, maxlength: 100 },
  duration: { type: String, required: true, trim: true, maxlength: 100 },
  instructions: { type: String, trim: true, maxlength: 500, default: '' }
}, { _id: false });

const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  items: { type: [itemSchema], validate: v => v.length > 0 },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Prescription', schema);
