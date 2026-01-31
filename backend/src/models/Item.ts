import mongoose, { Schema, Document } from 'mongoose';

/**
 * Item - Master catalog of all items (ingredients, products, menu items)
 * This is the central reference table for all inventory-related operations
 */
export interface IItem extends Document {
  item_name: string;
  item_type: 'ingredient' | 'menu_item' | 'product' | 'packaging' | 'inventory';
  sku?: string;
  category?: string;
  unit: string; // kg, g, l, ml, pcs, box, etc.
  conversion_factor?: number;
  default_price?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  expiry_tracking: boolean;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const ItemSchema: Schema = new Schema({
  item_name: { type: String, required: true },
  item_type: {
    type: String,
    enum: ['ingredient', 'menu_item', 'product', 'packaging', 'inventory'],
    required: true
  },
  sku: { type: String, unique: true, sparse: true },
  category: { type: String, index: true },
  unit: { type: String, required: true },
  conversion_factor: { type: Number, default: 1 }, // For unit conversions
  default_price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  is_active: { type: Boolean, default: true, index: true },
  expiry_tracking: { type: Boolean, default: false },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes
ItemSchema.index({ item_name: 'text', category: 'text' });
ItemSchema.index({ item_type: 1, is_active: 1 });
ItemSchema.index({ sku: 1 });

export default mongoose.model<IItem>('Item', ItemSchema);
