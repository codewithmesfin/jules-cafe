import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  item_type: 'ingredient' | 'product';
  quantity_available: number;
  reorder_level: number;
  created_at: Date;
  updated_at: Date;
}

const InventorySchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { 
    type: String, 
    enum: ['ingredient', 'product'], 
    default: 'ingredient' 
  },
  quantity_available: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

InventorySchema.index({ business_id: 1, item_id: 1, item_type: 1 }, { unique: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
