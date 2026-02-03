import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas_restaurant');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const saasAdminEmail = process.env.SAAS_ADMIN_EMAIL || 'admin@lunixpos.com';
    const saasAdminExists = await User.findOne({ role: 'saas_admin' });

    if (!saasAdminExists) {
      console.log('Creating default SaaS Admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.SAAS_ADMIN_PASSWORD || 'admin123', salt);

      await User.create({
        email: saasAdminEmail,
        password: hashedPassword,
        full_name: 'System Administrator',
        role: 'saas_admin',
        status: 'active',
        is_active: true,
        assigned_businesses: []
      });
      console.log('Default SaaS Admin created successfully.');
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
