import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role: 'saas_admin' | 'admin' | 'manager' | 'cashier' | 'waiter';
  is_active: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'onboarding';
  default_business_id?: mongoose.Types.ObjectId;
  assigned_businesses?: mongoose.Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetRequired?: boolean;
  last_login?: Date;
  login_attempts?: number;
  lock_until?: Date;
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
  default_business_id: { type: Schema.Types.ObjectId, ref: 'Business', index: true },
  assigned_businesses: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetRequired: { type: Boolean, default: false },
  last_login: Date,
  login_attempts: { type: Number, default: 0 },
  lock_until: Date,
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'users'
});

UserSchema.index({ email: 1 });
UserSchema.index({ default_business_id: 1, role: 1 });
UserSchema.index({ role: 1, status: 1 });

UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lock_until && this.lock_until > new Date());
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);
