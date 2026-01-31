import mongoose, { Schema, Document } from 'mongoose';

/**
 * StockEntry - Tracks all stock movements (purchases, sales, waste, transfers, adjustments)
 * This is the core table for answering "what has been consumed/sold"
 */
export interface IStockEntry extends Document {
  branch_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  entry_type: 'purchase' | 'sale' | 'waste' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return' | 'purchase_return';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: mongoose.Types.ObjectId;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  performed_by: mongoose.Types.ObjectId;
  notes?: string;
}

const StockEntrySchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  entry_type: {
    type: String,
    enum: ['purchase', 'sale', 'waste', 'transfer_in', 'transfer_out', 'adjustment', 'return', 'purchase_return'],
    required: true
  },
  quantity: { type: Number, required: true }, // Positive for in, negative for out
  unit_cost: { type: Number },
  total_cost: { type: Number },
  reference_type: { type: String }, // 'Order', 'PurchaseOrder', 'WasteReport', 'Transfer'
  reference_id: { type: Schema.Types.ObjectId },
  previous_quantity: { type: Number, required: true },
  new_quantity: { type: Number, required: true },
  reason: { type: String },
  performed_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for fast querying
StockEntrySchema.index({ branch_id: 1, item_id: 1, created_at: -1 });
StockEntrySchema.index({ branch_id: 1, entry_type: 1, created_at: -1 });
StockEntrySchema.index({ item_id: 1, created_at: -1 });
StockEntrySchema.index({ reference_id: 1, reference_type: 1 });

export default mongoose.model<IStockEntry>('StockEntry', StockEntrySchema);
