import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  branch_name?: string;
  location_address?: string;
  is_active: boolean;
  opening_time?: string;
  closing_time?: string;
  capacity: number;
  company?: string;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BranchSchema: Schema = new Schema({
  branch_name: { type: String, default: 'Main Branch' },
  location_address: { type: String, default: 'TBD' },
  is_active: { type: Boolean, default: true },
  opening_time: { type: String, default: '09:00' },
  closing_time: { type: String, default: '22:00' },
  capacity: { type: Number, default: 50 },
  company: { type: String, default: 'Default Company' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IBranch>('Branch', BranchSchema);
