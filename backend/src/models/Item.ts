import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  item_name: string;
  item_type: 'menu_item' | 'inventory' | 'ingredient';
  category?: string;
  unit?: string;
  default_price?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ItemSchema: Schema = new Schema({
  item_name: { type: String, required: true },
  item_type: { 
    type: String, 
    enum: ['menu_item', 'inventory', 'ingredient'], 
    required: true 
  },
  category: { type: String, default: '' },
  unit: { type: String, default: '' },
  default_price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// Index for faster searches
ItemSchema.index({ item_name: 'text', category: 'text' });

export default mongoose.model<IItem>('Item', ItemSchema);
