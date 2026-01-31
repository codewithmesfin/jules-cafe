import mongoose, { Schema, Document } from 'mongoose';

/**
 * MenuItem - Menu items available for sale
 * References Item table for the base item details
 */
export interface IMenuItem extends Document {
  item_id: mongoose.Types.ObjectId; // Reference to Item table
  category_id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes?: number;
  calories?: number;
  allergens?: string[];
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const MenuItemSchema: Schema = new Schema({
  item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  base_price: { type: Number, required: true },
  image_url: { type: String, default: '' },
  is_available: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  prep_time_minutes: { type: Number },
  calories: { type: Number },
  allergens: [{ type: String }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes
MenuItemSchema.index({ category_id: 1, is_available: 1 });
MenuItemSchema.index({ item_id: 1 }, { unique: true }); // One menu item per item

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
