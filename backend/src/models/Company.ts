import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  settings?: {
    currency?: string;
    timezone?: string;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<ICompany>('Company', CompanySchema);
