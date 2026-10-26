import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('YOUR_REAL_CLUSTER') || uri.includes('DB_USERNAME')) {
    throw new Error('Set a valid MONGODB_URI in backend/.env before starting MediCore.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
