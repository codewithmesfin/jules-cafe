import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  branch_name: string;
  location_address: string;
  is_active: boolean;
  opening_time: string;
  closing_time: string;
  capacity: number;
  company: string;
}

const BranchSchema: Schema = new Schema({
  branch_name: { type: String, required: true },
  location_address: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  opening_time: { type: String, required: true },
  closing_time: { type: String, required: true },
  capacity: { type: Number, required: true },
  company: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);
