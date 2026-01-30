import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  MOCK_BRANCHES,
  MOCK_TABLES,
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_USERS,
  MOCK_ORDERS,
  MOCK_ORDER_ITEMS,
  MOCK_RESERVATIONS,
  MOCK_REVIEWS,
  MOCK_INVENTORY,
  MOCK_RECIPES
} from '../src/utils/mockData';
import {
  BranchModel,
  TableModel,
  CategoryModel,
  MenuItemModel,
  UserModel,
  OrderModel,
  OrderItemModel,
  ReservationModel,
  ReviewModel,
  InventoryItemModel,
  RecipeModel
} from '../src/models/index';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await BranchModel.deleteMany({});
    await TableModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await MenuItemModel.deleteMany({});
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
    await OrderItemModel.deleteMany({});
    await ReservationModel.deleteMany({});
    await ReviewModel.deleteMany({});
    await InventoryItemModel.deleteMany({});
    await RecipeModel.deleteMany({});

    // Mapping for IDs
    const idMap: { [key: string]: any } = {};

    // Seed Branches
    console.log('Seeding branches...');
    for (const b of MOCK_BRANCHES) {
      const { id, ...data } = b;
      const doc = await BranchModel.create(data);
      idMap[id] = doc._id;
    }

    // Seed Categories
    console.log('Seeding categories...');
    for (const c of MOCK_CATEGORIES) {
      const { id, ...data } = c;
      const doc = await CategoryModel.create(data);
      idMap[id] = doc._id;
    }

    // Seed Menu Items
    console.log('Seeding menu items...');
    for (const m of MOCK_MENU_ITEMS) {
      const { id, category_id, ...data } = m;
      const doc = await MenuItemModel.create({
        ...data,
        category_id: idMap[category_id]
      });
      idMap[id] = doc._id;
    }

    // Seed Users
    console.log('Seeding users...');
    for (const u of MOCK_USERS) {
      const { id, branch_id, ...data } = u;
      const doc = await UserModel.create({
        ...data,
        password: 'password123', // Default password for all mock users
        branch_id: branch_id ? idMap[branch_id] : undefined
      });
      idMap[id] = doc._id;
    }

    // Seed Tables
    console.log('Seeding tables...');
    for (const t of MOCK_TABLES) {
      const { id, branch_id, ...data } = t;
      const doc = await TableModel.create({
        ...data,
        branch_id: idMap[branch_id]
      });
      idMap[id] = doc._id;
    }

    // Seed Orders
    console.log('Seeding orders...');
    for (const o of MOCK_ORDERS) {
      const { id, customer_id, branch_id, table_id, ...data } = o;
      const doc = await OrderModel.create({
        ...data,
        customer_id: idMap[customer_id],
        branch_id: idMap[branch_id],
        table_id: table_id ? idMap[table_id] : undefined
      });
      idMap[id] = doc._id;
    }

    // Seed Order Items
    console.log('Seeding order items...');
    for (const oi of MOCK_ORDER_ITEMS) {
      const { id, order_id, menu_item_id, ...data } = oi;
      await OrderItemModel.create({
        ...data,
        order_id: idMap[order_id],
        menu_item_id: idMap[menu_item_id]
      });
    }

    // Seed Reservations
    console.log('Seeding reservations...');
    for (const r of MOCK_RESERVATIONS) {
      const { id, customer_id, branch_id, table_id, ...data } = r;
      await ReservationModel.create({
        ...data,
        customer_id: idMap[customer_id],
        branch_id: idMap[branch_id],
        table_id: table_id ? idMap[table_id] : undefined
      });
    }

    // Seed Reviews
    console.log('Seeding reviews...');
    for (const rv of MOCK_REVIEWS) {
      const { id, customer_id, branch_id, order_id, ...data } = rv;
      await ReviewModel.create({
        ...data,
        customer_id: idMap[customer_id],
        branch_id: idMap[branch_id],
        order_id: order_id ? idMap[order_id] : undefined
      });
    }

    // Seed Inventory
    console.log('Seeding inventory...');
    for (const i of MOCK_INVENTORY) {
      const { id, branch_id, ...data } = i;
      await InventoryItemModel.create({
        ...data,
        branch_id: idMap[branch_id]
      });
    }

    // Seed Recipes
    console.log('Seeding recipes...');
    for (const rc of MOCK_RECIPES) {
      const { id, menu_item_id, ...data } = rc;
      await RecipeModel.create({
        ...data,
        menu_item_id: idMap[menu_item_id]
      });
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
