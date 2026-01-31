import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menu_item_id: mongoose.Types.ObjectId;
  menu_item_name: string;
  variant_id?: mongoose.Types.ObjectId;
  variant_name?: string;
  quantity: number;
  unit_price: number;
}

export interface IOrder extends Document {
  order_number: string;
  customer_id: mongoose.Types.ObjectId;
  branch_id: mongoose.Types.ObjectId;
  table_id?: mongoose.Types.ObjectId;
  waiter_id?: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  type: 'walk-in' | 'self-service';
  total_amount: number;
  discount_amount?: number;
  cancel_reason?: string;
  items: IOrderItem[];
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  menu_item_name: { type: String, required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: 'MenuVariant' },
  variant_name: { type: String },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
  order_number: { type: String, required: true, unique: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table' },
  waiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['walk-in', 'self-service'],
    default: 'walk-in'
  },
  total_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  cancel_reason: { type: String },
  items: [OrderItemSchema],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IOrder>('Order', OrderSchema);
