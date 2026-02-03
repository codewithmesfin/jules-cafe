import mongoose, { Schema, Document } from 'mongoose';

/**
 * User Model - Handles all user types including:
 * - saas_admin: Global system administrator
 * - admin: Business owner (tenant owner)
 * - manager: Business manager
 * - cashier: Cashier for processing payments
 * - waiter: Staff for taking orders
 */
export interface IUser extends Document {
  email: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role: 'saas_admin' | 'admin' | 'manager' | 'cashier' | 'waiter';
  is_active: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'onboarding';
  
  // Multi-tenancy - User's default business
  default_business_id?: mongoose.Types.ObjectId;
  
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
  password: { type: String },
  full_name: { type: String, trim: true },
  phone: { type: String, trim: true },
  role: {
    type: String,
    enum: ['saas_admin', 'admin', 'manager', 'cashier', 'waiter'],
    default: 'admin'
  },
  is_active: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'onboarding'],
    default: 'pending'
  },
  
  // Multi-tenancy - User belongs to a business
  default_business_id: { type: Schema.Types.ObjectId, ref: 'Business', index: true },
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetRequired: { type: Boolean, default: false },
  last_login: Date,
  login_attempts: { type: Number, default: 0 },
  lock_until: Date,
  
  // Audit
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'users'
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ default_business_id: 1, role: 1 });
UserSchema.index({ role: 1, status: 1 });

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lock_until && this.lock_until > new Date());
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
