import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  category_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
}

const MenuItemSchema: Schema = new Schema({
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  base_price: { type: Number, required: true },
  image_url: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
