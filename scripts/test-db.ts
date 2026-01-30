import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri?.split('@')[1]); // Log host part only

  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
