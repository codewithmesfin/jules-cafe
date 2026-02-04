import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  ingredient_id: mongoose.Types.ObjectId;
  quantity_required: number;
  created_at: Date;
  updated_at: Date;
}

const RecipeSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity_required: { type: Number, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

RecipeSchema.index({ business_id: 1, product_id: 1 });

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
