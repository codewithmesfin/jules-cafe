import mongoose, { Schema, Document } from 'mongoose';

/**
 * User - Handles all user types including:
 * - admin: System administrator
 * - manager: Branch manager (can manage their branch)
 * - staff: Restaurant staff (chefs, waiters, etc.)
 * - cashier: Cashier for processing payments
 * - customer: End customers
 */
export interface IUser extends Document {
  email: string;
  username?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'cashier' | 'customer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  branch_id?: mongoose.Types.ObjectId;
  company?: string;
  
  // Customer-specific fields
  customer_type?: 'regular' | 'vip' | 'member';
  loyalty_points?: number;
  discount_rate?: number;
  total_spent?: number;
  visit_count?: number;
  
  // Staff-specific fields
  employee_id?: string;
  hire_date?: Date;
  position?: string;
  salary?: number;
  
  // Manager-specific fields
  managed_branches?: mongoose.Types.ObjectId[];
  
  // Security
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetRequired?: boolean;
  last_login?: Date;
  login_attempts?: number;
  lock_until?: Date;
  
  // Audit
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, sparse: true, trim: true },
  password: { type: String },
  full_name: { type: String, trim: true },
  phone: { type: String, trim: true },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'cashier', 'customer'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  company: { type: String },
  
  // Customer-specific
  customer_type: {
    type: String,
    enum: ['regular', 'vip', 'member'],
    default: 'regular'
  },
  loyalty_points: { type: Number, default: 0 },
  discount_rate: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  
  // Staff-specific
  employee_id: { type: String },
  hire_date: { type: Date },
  position: { type: String },
  salary: { type: Number },
  
  // Manager-specific
  managed_branches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetRequired: { type: Boolean, default: false },
  last_login: Date,
  login_attempts: { type: Number, default: 0 },
  lock_until: Date,
  
  // Audit
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ branch_id: 1, role: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ customer_type: 1 });

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lock_until && this.lock_until > new Date());
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
