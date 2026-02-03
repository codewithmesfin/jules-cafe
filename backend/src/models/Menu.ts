import mongoose, { Schema, Document } from 'mongoose';

export interface IMenu extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  is_available: boolean;
  display_order: number;
  available_from?: string; // Time string like "08:00"
  available_to?: string;   // Time string like "22:00"
  created_at: Date;
  updated_at: Date;
}

const MenuSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  is_available: { type: Boolean, default: true },
  display_order: { type: Number, default: 0 },
  available_from: { type: String },
  available_to: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

MenuSchema.index({ business_id: 1, product_id: 1 });

export default mongoose.model<IMenu>('Menu', MenuSchema);
