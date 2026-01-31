import mongoose, { Schema, Document } from 'mongoose';

/**
 * InventoryItem - Tracks current stock levels at each branch
 * Answers: "What is there?" and "What is left?"
 */
export interface IInventoryItem extends Document {
  branch_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  current_quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  reorder_quantity?: number;
  last_restocked?: Date;
  expiry_date?: Date;
  location?: string;
  last_purchase_price?: number;
  average_cost?: number;
  is_active: boolean;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const InventoryItemSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  current_quantity: { type: Number, required: true, default: 0 },
  reserved_quantity: { type: Number, default: 0 },
  min_stock_level: { type: Number, required: true },
  max_stock_level: { type: Number },
  reorder_quantity: { type: Number },
  last_restocked: { type: Date },
  expiry_date: { type: Date },
  location: { type: String },
  last_purchase_price: { type: Number },
  average_cost: { type: Number },
  is_active: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual fields
InventoryItemSchema.virtual('available_quantity').get(function(this: IInventoryItem) {
  return this.current_quantity - (this.reserved_quantity || 0);
});

InventoryItemSchema.virtual('is_low_stock').get(function(this: IInventoryItem) {
  return this.current_quantity <= this.min_stock_level;
});

InventoryItemSchema.virtual('is_out_of_stock').get(function(this: IInventoryItem) {
  return this.current_quantity <= 0;
});

// Enable virtuals in JSON output
InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });

// Unique constraint: one entry per item per branch
InventoryItemSchema.index({ branch_id: 1, item_id: 1 }, { unique: true });

// Indexes for common queries
InventoryItemSchema.index({ branch_id: 1, is_active: 1 });
InventoryItemSchema.index({ branch_id: 1, current_quantity: 1 });
InventoryItemSchema.index({ branch_id: 1, min_stock_level: 1 });

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
