import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  ingredient_id: mongoose.Types.ObjectId;
  quantity_available: number;
  reorder_level: number;
  created_at: Date;
  updated_at: Date;
}

const InventorySchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity_available: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

InventorySchema.index({ business_id: 1, ingredient_id: 1 }, { unique: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
