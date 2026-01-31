import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  branch_id: mongoose.Types.ObjectId;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
}

const InventoryItemSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  item_name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  min_stock: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
