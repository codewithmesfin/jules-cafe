import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  business_id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const UnitSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  is_active: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UnitSchema.index({ business_id: 1, name: 1 }, { unique: true });

export default mongoose.model<IUnit>('Unit', UnitSchema);
