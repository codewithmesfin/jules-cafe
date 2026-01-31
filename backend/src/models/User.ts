import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'cashier' | 'customer';
  status: 'active' | 'inactive';
  branch_id?: mongoose.Types.ObjectId;
  company?: string;
  customer_type?: 'regular' | 'vip' | 'member';
  discount_rate?: number;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetRequired?: boolean;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  full_name: { type: String },
  phone: { type: String },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'cashier', 'customer'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  company: { type: String },
  customer_type: {
    type: String,
    enum: ['regular', 'vip', 'member'],
    default: 'regular'
  },
  discount_rate: { type: Number, default: 0 },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetRequired: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<IUser>('User', UserSchema);
