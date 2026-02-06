import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  name: string;
  unit_id: mongoose.Types.ObjectId;
  unit?: mongoose.Types.ObjectId | { name: string };
  cost_per_unit: number;
  sku?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const IngredientSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  unit_id: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  cost_per_unit: { type: Number, default: 0 },
  sku: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

IngredientSchema.index({ business_id: 1, name: 1 });
IngredientSchema.index({ business_id: 1, unit_id: 1 });

export default mongoose.model<IIngredient>('Ingredient', IngredientSchema);
