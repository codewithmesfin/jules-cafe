import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Branch from './models/Branch';
import Category from './models/Category';
import MenuItem from './models/MenuItem';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_restaurant';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 1. Create Admin
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      full_name: 'Super Admin',
    });
    console.log('Admin user created');

    // 2. Create a Branch
    const branch = await Branch.create({
      branch_name: 'Main Branch',
      location_address: '123 Main St, Food City',
      is_active: true,
      opening_time: '08:00',
      closing_time: '22:00',
      capacity: 50,
      company: 'QuickServe SaaS',
    });
    console.log('Branch created');

    // 3. Create a Manager
    await User.create({
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'manager',
      status: 'active',
      branch_id: branch._id,
      full_name: 'Branch Manager',
      passwordResetRequired: true
    });
    console.log('Manager user created');

    // 4. Create Categories
    const coffeeCat = await Category.create({
      name: 'Coffee',
      description: 'Energizing drinks',
      is_active: true,
    });
    const snacksCat = await Category.create({
      name: 'Snacks',
      description: 'Quick bites',
      is_active: true,
    });
    console.log('Categories created');

    // 5. Create Menu Items
    await MenuItem.create([
      {
        category_id: coffeeCat.id,
        name: 'Espresso',
        description: 'Strong and bold',
        base_price: 3.5,
        image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',
        is_active: true,
      },
      {
        category_id: snacksCat.id,
        name: 'Croissant',
        description: 'Flaky and buttery',
        base_price: 4.5,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
        is_active: true,
      }
    ]);
    console.log('Menu items created');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
