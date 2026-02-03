import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  business_id: mongoose.Types.ObjectId;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  total_spent: number;
  last_visit?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const CustomerSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  full_name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  address: { type: String },
  loyalty_points: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  last_visit: { type: Date },
  notes: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

CustomerSchema.index({ business_id: 1, email: 1 });
CustomerSchema.index({ business_id: 1, phone: 1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
