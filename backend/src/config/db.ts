import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Inventory from '../models/Inventory';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas_restaurant');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy index if it exists (schema was refactored from ingredient_id to item_id)
    try {
      await Inventory.collection.dropIndex('business_id_1_ingredient_id_1');
      console.log('Dropped legacy index: business_id_1_ingredient_id_1');
    } catch (err: any) {
      // Index may not exist, which is fine
      if (err.code !== 27) { // 27 = IndexNotFound
        console.log('Legacy index check completed (may not exist)');
      }
    }

    // Clean up documents with null ingredient_id (legacy data)
    // Use $type to only match documents where ingredient_id explicitly exists and is null
    // Note: { ingredient_id: null } would also match documents where field doesn't exist
    try {
      const result = await Inventory.deleteMany({ ingredient_id: { $type: 'null' } });
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} legacy documents with null ingredient_id`);
      }
    } catch (err) {
      console.log('Legacy document cleanup completed');
    }

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
