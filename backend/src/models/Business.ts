import mongoose, { Schema, Document } from 'mongoose';

/**
 * Business Model - Tenant entity
 * Each business represents a tenant in the multi-tenant SaaS system
 */
export interface IBusiness extends Document {
  owner_id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  legal_name?: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: { open: string; close: string };
  tax_rate?: number;
  currency?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const BusinessSchema: Schema = new Schema({
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  legal_name: { type: String, trim: true },
  logo: { type: String },
  banner: { type: String },
  description: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  opening_hours: {
    open: { type: String },
    close: { type: String }
  },
  tax_rate: { type: Number, default: 0 },
  currency: { type: String, default: 'ETB' },
  is_active: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'businesses'
});

// Indexes for efficient queries
BusinessSchema.index({ name: 'text' });

export default mongoose.model<IBusiness>('Business', BusinessSchema);
