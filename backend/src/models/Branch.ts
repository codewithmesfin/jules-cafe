import mongoose, { Schema, Document } from 'mongoose';

/**
 * Branch Model - Represents a branch/location belonging to a company
 * Each branch is scoped to a company (tenant isolation)
 */
export interface IBranch extends Document {
  branch_name: string;
  location_address?: string;
  is_active: boolean;
  opening_time?: string;
  closing_time?: string;
  capacity: number;
  
  // Tenant isolation - Branch belongs to a company
  company_id: mongoose.Types.ObjectId;
  
  // Contact information
  phone?: string;
  email?: string;
  
  // Location details
  latitude?: number;
  longitude?: number;
  
  // Operating settings
  settings?: {
    accept_reservations: boolean;
    delivery_available: boolean;
    pickup_available: boolean;
    online_ordering: boolean;
  };
  
  // Audit
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BranchSchema: Schema = new Schema({
  branch_name: { type: String, required: true, default: 'Main Branch' },
  location_address: { type: String, default: 'TBD' },
  is_active: { type: Boolean, default: true },
  opening_time: { type: String, default: '09:00' },
  closing_time: { type: String, default: '22:00' },
  capacity: { type: Number, default: 50 },
  
  // Tenant isolation - Branch belongs to a company
  company_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true 
  },
  
  phone: { type: String },
  email: { type: String },
  
  latitude: { type: Number },
  longitude: { type: Number },
  
  settings: {
    accept_reservations: { type: Boolean, default: true },
    delivery_available: { type: Boolean, default: false },
    pickup_available: { type: Boolean, default: true },
    online_ordering: { type: Boolean, default: true }
  },
  
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'branches'
});

// Indexes
BranchSchema.index({ company_id: 1, is_active: 1 });
BranchSchema.index({ location_address: 'text' });

export default mongoose.model<IBranch>('Branch', BranchSchema);
