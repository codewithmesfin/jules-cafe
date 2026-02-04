import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

OrderItemSchema.index({ order_id: 1 });
OrderItemSchema.index({ business_id: 1, product_id: 1 });
OrderItemSchema.index({ created_at: -1 });

export default mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);
