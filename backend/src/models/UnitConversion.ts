import mongoose, { Schema, Document } from 'mongoose';

export interface IUnitConversion extends Document {
  business_id: mongoose.Types.ObjectId;
  from_unit: string;
  to_unit: string;
  factor: number;
  created_at: Date;
  updated_at: Date;
}

const UnitConversionSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  from_unit: { type: String, required: true },
  to_unit: { type: String, required: true },
  factor: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UnitConversionSchema.index({ business_id: 1, from_unit: 1, to_unit: 1 }, { unique: true });

export default mongoose.model<IUnitConversion>('UnitConversion', UnitConversionSchema);
