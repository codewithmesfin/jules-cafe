import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Business from './models/Business';
import Unit from './models/Unit';
import UnitConversion from './models/UnitConversion';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abc_cafe';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Business.deleteMany({});
  await Unit.deleteMany({});
  await UnitConversion.deleteMany({});
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

  // Create default units for each business
  const businesses = [business1._id, business2._id, business3._id];
  
  const defaultUnits = [
    { name: 'kg', description: 'Kilogram' },
    { name: 'g', description: 'Gram' },
    { name: 'mg', description: 'Milligram' },
    { name: 'L', description: 'Liter' },
    { name: 'ml', description: 'Milliliter' },
    { name: 'pcs', description: 'Pieces' },
    { name: 'box', description: 'Box' },
    { name: 'pack', description: 'Pack' },
    { name: 'dozen', description: 'Dozen' },
    { name: 'cup', description: 'Cup' },
    { name: 'tablespoon', description: 'Tablespoon' },
    { name: 'teaspoon', description: 'Teaspoon' }
  ];

  for (const businessId of businesses) {
    // Create units
    const createdUnits = await Unit.insertMany(
      defaultUnits.map(unit => ({
        ...unit,
        business_id: businessId,
        is_active: true
      }))
    );

    // Create common unit conversions (weight)
    const kg = createdUnits.find(u => u.name === 'kg');
    const g = createdUnits.find(u => u.name === 'g');
    const mg = createdUnits.find(u => u.name === 'mg');

    if (kg && g) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'kg',
        to_unit: 'g',
        factor: 1000
      });
    }
    if (kg && mg) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'kg',
        to_unit: 'mg',
        factor: 1000000
      });
    }
    if (g && mg) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'g',
        to_unit: 'mg',
        factor: 1000
      });
    }

    // Volume conversions
    const L = createdUnits.find(u => u.name === 'L');
    const ml = createdUnits.find(u => u.name === 'ml');

    if (L && ml) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'L',
        to_unit: 'ml',
        factor: 1000
      });
    }

    // Pieces to dozen
    const pcs = createdUnits.find(u => u.name === 'pcs');
    const dozen = createdUnits.find(u => u.name === 'dozen');

    if (pcs && dozen) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'dozen',
        to_unit: 'pcs',
        factor: 12
      });
    }

    // Cooking volume conversions
    const cup = createdUnits.find(u => u.name === 'cup');
    const tablespoon = createdUnits.find(u => u.name === 'tablespoon');
    const teaspoon = createdUnits.find(u => u.name === 'teaspoon');
    const mlUnit = createdUnits.find(u => u.name === 'ml');

    if (cup && mlUnit) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'cup',
        to_unit: 'ml',
        factor: 240
      });
    }
    if (tablespoon && mlUnit) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'tablespoon',
        to_unit: 'ml',
        factor: 15
      });
    }
    if (teaspoon && mlUnit) {
      await UnitConversion.create({
        business_id: businessId,
        from_unit: 'teaspoon',
        to_unit: 'ml',
        factor: 5
      });
    }
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Primary SaaS Admin: admin@lunixpos.com / admin123');
  console.log('  Demo SaaS Admin: admin@abccafe.com / admin123');
  console.log('  Business 1: business1@abccafe.com / admin123');
  console.log('  Business 2: business2@abccafe.com / admin123');
  console.log('  Business 3: business3@abccafe.com / admin123');
  console.log('\nDefault units created: kg, g, mg, L, ml, pcs, box, pack, dozen, cup, tablespoon, teaspoon');
  console.log('Unit conversions seeded for weight, volume, and cooking measurements');

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

seed().catch(console.error);
