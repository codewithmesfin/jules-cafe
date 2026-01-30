import mongoose, { Schema, model } from 'mongoose';

const models = mongoose.models;

const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
};

// User Schema
const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'cashier', 'customer', 'staff'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  customer_type: { type: String, enum: ['regular', 'vip', 'member'] },
  discount_rate: { type: Number, default: 0 },
}, { timestamps: true, toJSON });

export const UserModel = models.User || model('User', UserSchema);

// Branch Schema
const BranchSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  operating_hours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  capacity: { type: Number, required: true },
}, { timestamps: true, toJSON });

export const BranchModel = models.Branch || model('Branch', BranchSchema);

// Table Schema
const TableSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_number: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
}, { timestamps: true, toJSON });

export const TableModel = models.Table || model('Table', TableSchema);

// MenuCategory Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: true, toJSON });

export const CategoryModel = models.Category || model('Category', CategorySchema);

// MenuItem Schema
const MenuItemSchema = new Schema({
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  base_price: { type: Number, required: true },
  image_url: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: true, toJSON });

export const MenuItemModel = models.MenuItem || model('MenuItem', MenuItemSchema);

// MenuVariant Schema
const MenuVariantSchema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price_override: { type: Number },
}, { timestamps: true, toJSON });

export const MenuVariantModel = models.MenuVariant || model('MenuVariant', MenuVariantSchema);

// BranchMenuItem Schema (Availability per branch)
const BranchMenuItemSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  is_available: { type: Boolean, default: true },
}, { timestamps: true, toJSON });

export const BranchMenuItemModel = models.BranchMenuItem || model('BranchMenuItem', BranchMenuItemSchema);

// Order Schema
const OrderSchema = new Schema({
  order_number: { type: String, required: true, unique: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table' },
  waiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
  type: { type: String, enum: ['walk-in', 'self-service'], required: true },
  total_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  cancel_reason: { type: String },
}, { timestamps: true, toJSON });

export const OrderModel = models.Order || model('Order', OrderSchema);

// OrderItem Schema
const OrderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  menu_item_name: { type: String, required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'MenuVariant' },
  variant_name: { type: String },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
}, { timestamps: true, toJSON });

export const OrderItemModel = models.OrderItem || model('OrderItem', OrderItemSchema);

// Reservation Schema
const ReservationSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table' },
  waiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  reservation_date: { type: String, required: true },
  reservation_time: { type: String, required: true },
  guests_count: { type: Number, required: true },
  status: { type: String, enum: ['requested', 'confirmed', 'seated', 'cancelled', 'no_show'], default: 'requested' },
  note: { type: String },
}, { timestamps: true, toJSON });

export const ReservationModel = models.Reservation || model('Reservation', ReservationSchema);

// Review Schema
const ReviewSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  reservation_id: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  is_approved: { type: Boolean, default: false },
}, { timestamps: true, toJSON });

export const ReviewModel = models.Review || model('Review', ReviewSchema);

// InventoryItem Schema
const InventoryItemSchema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  item_name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  min_stock: { type: Number, required: true },
}, { timestamps: true, toJSON });

export const InventoryItemModel = models.InventoryItem || model('InventoryItem', InventoryItemSchema);

// Recipe Schema
const RecipeSchema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  ingredients: [{
    item_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
  }],
  instructions: { type: String },
}, { timestamps: true, toJSON });

export const RecipeModel = models.Recipe || model('Recipe', RecipeSchema);
