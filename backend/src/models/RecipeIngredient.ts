import mongoose, { Schema, Document } from 'mongoose';

/**
 * RecipeIngredient - Links recipes to ingredients with quantities
 * Separated into its own collection for better query performance
 */
export interface IRecipeIngredient extends Document {
  recipe_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  wastage_percentage?: number;
  sequence_order?: number;
  is_optional: boolean;
  notes?: string;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const RecipeIngredientSchema: Schema = new Schema({
  recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  wastage_percentage: { type: Number, default: 0 },
  sequence_order: { type: Number, default: 0 },
  is_optional: { type: Boolean, default: false },
  notes: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

RecipeIngredientSchema.index({ recipe_id: 1 });
RecipeIngredientSchema.index({ item_id: 1 });

export default mongoose.model<IRecipeIngredient>('RecipeIngredient', RecipeIngredientSchema);
