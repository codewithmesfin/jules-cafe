import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category_id?: mongoose.Types.ObjectId;
  image_url?: string;
  cost: number;
  price: number;
  status: 'draft' | 'published' | 'out_of_stock';
  sku?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ProductSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category' },
  image_url: { type: String },
  cost: { type: Number, default: 0 },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'out_of_stock'],
    default: 'published'
  },
  sku: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

ProductSchema.index({ business_id: 1, name: 1 });
ProductSchema.index({ sku: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
