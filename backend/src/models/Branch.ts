import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  location: string;
  is_active: boolean;
  operating_hours: {
    open: string;
    close: string;
  };
  capacity: number;
  company: string;
}

const BranchSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  operating_hours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  capacity: { type: Number, required: true },
  company: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<IBranch>('Branch', BranchSchema);
