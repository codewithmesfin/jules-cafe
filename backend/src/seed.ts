import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Business from './models/Business';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abc_cafe';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Business.deleteMany({});
  console.log('Cleared existing data');

  // Create SaaS Admin (primary super admin)
  const saasAdmin1 = await User.create({
    email: 'admin@lunixpos.com',
    password: await bcrypt.hash('admin123', 10),
    full_name: 'Super Admin',
    phone: '+251911111111',
    role: 'saas_admin',
    status: 'active',
    is_active: true
  });
  console.log('Created SaaS Admin:', saasAdmin1.email);

  // Create SaaS Admin (backup/demo)
  const saasAdmin2 = await User.create({
    email: 'admin@abccafe.com',
    password: await bcrypt.hash('admin123', 10),
    full_name: 'Super Admin Demo',
    phone: '+251911111112',
    role: 'saas_admin',
    status: 'active',
    is_active: true
  });
  console.log('Created SaaS Admin:', saasAdmin2.email);

  // Create some admin users with businesses
  const admin1Password = await bcrypt.hash('admin123', 10);
  const admin1 = await User.create({
    email: 'business1@abccafe.com',
    password: admin1Password,
    full_name: 'John Doe',
    phone: '+251922222222',
    role: 'admin',
    status: 'active',
    is_active: true
  });

  const business1 = await Business.create({
    owner_id: admin1._id,
    name: 'Coffee Corner',
    slug: 'coffee-corner',
    legal_name: 'Coffee Corner LLC',
    description: 'A cozy coffee shop in the city center',
    address: 'Addis Ababa, Ethiopia',
    is_active: true
  });

  admin1.default_business_id = business1._id as any;
  admin1.assigned_businesses = [business1._id] as any;
  await admin1.save();
  console.log('Created Business 1:', business1.name);

  // Create second admin
  const admin2Password = await bcrypt.hash('admin123', 10);
  const admin2 = await User.create({
    email: 'business2@abccafe.com',
    password: admin2Password,
    full_name: 'Jane Smith',
    phone: '+251933333333',
    role: 'admin',
    status: 'active',
    is_active: true
  });

  const business2 = await Business.create({
    owner_id: admin2._id,
    name: 'Pizza Palace',
    slug: 'pizza-palace',
    legal_name: 'Pizza Palace Inc',
    description: 'Best pizza in town',
    address: 'Addis Ababa, Ethiopia',
    is_active: true
  });

  admin2.default_business_id = business2._id as any;
  admin2.assigned_businesses = [business2._id] as any;
  await admin2.save();
  console.log('Created Business 2:', business2.name);

  // Create third admin with inactive business
  const admin3Password = await bcrypt.hash('admin123', 10);
  const admin3 = await User.create({
    email: 'business3@abccafe.com',
    password: admin3Password,
    full_name: 'Bob Wilson',
    phone: '+251944444444',
    role: 'admin',
    status: 'pending',
    is_active: true
  });

  const business3 = await Business.create({
    owner_id: admin3._id,
    name: 'Burger Barn',
    slug: 'burger-barn',
    legal_name: 'Burger Barn Ltd',
    description: 'Gourmet burgers',
    address: 'Addis Ababa, Ethiopia',
    is_active: false
  });

  admin3.default_business_id = business3._id as any;
  admin3.assigned_businesses = [business3._id] as any;
  await admin3.save();
  console.log('Created Business 3:', business3.name);

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Primary SaaS Admin: admin@lunixpos.com / admin123');
  console.log('  Demo SaaS Admin: admin@abccafe.com / admin123');
  console.log('  Business 1: business1@abccafe.com / admin123');
  console.log('  Business 2: business2@abccafe.com / admin123');
  console.log('  Business 3: business3@abccafe.com / admin123');

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

seed().catch(console.error);
