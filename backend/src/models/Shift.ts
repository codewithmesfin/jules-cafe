import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  business_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  clock_in: Date;
  clock_out?: Date;
  duration_minutes?: number;
  status: 'active' | 'completed';
  notes?: string;
}

const ShiftSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clock_in: { type: Date, default: Date.now },
  clock_out: { type: Date },
  duration_minutes: { type: Number },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  notes: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<IShift>('Shift', ShiftSchema);
