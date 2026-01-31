import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeIngredient {
  item_name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  menu_item_id: mongoose.Types.ObjectId;
  ingredients: IRecipeIngredient[];
  instructions?: string;
}

const RecipeIngredientSchema = new Schema({
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const RecipeSchema: Schema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  ingredients: [RecipeIngredientSchema],
  instructions: { type: String },
}, { timestamps: true });

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
