import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  ingredient_id: mongoose.Types.ObjectId;
  change_quantity: number;
  reference_type: 'purchase' | 'sale' | 'waste' | 'adjustment';
  reference_id?: mongoose.Types.ObjectId;
  created_at: Date;
}

const InventoryTransactionSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  change_quantity: { type: Number, required: true },
  reference_type: {
    type: String,
    enum: ['purchase', 'sale', 'waste', 'adjustment'],
    required: true
  },
  reference_id: { type: Schema.Types.ObjectId },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

InventoryTransactionSchema.index({ business_id: 1, ingredient_id: 1 });

export default mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
