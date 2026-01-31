import mongoose, { Schema, Document } from 'mongoose';

/**
 * Recipe - Defines what ingredients are needed to make a menu item
 * Uses separate RecipeIngredient collection for better scalability
 */
export interface IRecipe extends Document {
  menu_item_id: mongoose.Types.ObjectId;
  recipe_name?: string;
  version: number;
  is_default: boolean;
  yield_quantity: number;
  prep_time?: number;
  cook_time?: number;
  instructions?: string;
  notes?: string;
  is_active: boolean;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const RecipeSchema: Schema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  recipe_name: { type: String },
  version: { type: Number, required: true, default: 1 },
  is_default: { type: Boolean, default: false },
  yield_quantity: { type: Number, required: true, default: 1 },
  prep_time: { type: Number }, // in minutes
  cook_time: { type: Number }, // in minutes
  instructions: { type: String },
  notes: { type: String },
  is_active: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for fast lookup
RecipeSchema.index({ menu_item_id: 1, is_default: 1 });
RecipeSchema.index({ menu_item_id: 1, is_active: 1 });

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
