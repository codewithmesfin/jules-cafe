import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  item_type: 'ingredient' | 'product';
  change_quantity: number;
  reference_type: 'purchase' | 'sale' | 'waste' | 'adjustment' | 'production';
  reference_id?: mongoose.Types.ObjectId;
  note?: string;
  created_at: Date;
}

const InventoryTransactionSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { 
    type: String, 
    enum: ['ingredient', 'product'], 
    default: 'ingredient' 
  },
  change_quantity: { type: Number, required: true },
  reference_type: {
    type: String,
    enum: ['purchase', 'sale', 'waste', 'adjustment', 'production'],
    required: true
  },
  reference_id: { type: Schema.Types.ObjectId },
  note: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

InventoryTransactionSchema.index({ business_id: 1, item_id: 1, item_type: 1 });

export default mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
