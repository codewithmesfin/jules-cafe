import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  customer_id?: mongoose.Types.ObjectId;
  table_id?: mongoose.Types.ObjectId;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  order_status: 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method?: 'cash' | 'card' | 'mobile' | 'other';
  notes?: string;
  order_number?: string;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer' },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table' },
  order_type: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in'
  },
  order_status: {
    type: String,
    enum: ['preparing', 'ready', 'delivered', 'completed', 'cancelled'],
    default: 'preparing'
  },
  total_amount: { type: Number, default: 0 },
  payment_status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'other']
  },
  notes: { type: String },
  order_number: { type: String, unique: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

OrderSchema.index({ business_id: 1, order_status: 1 });
OrderSchema.index({ customer_id: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
