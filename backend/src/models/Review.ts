import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  customer_id: mongoose.Types.ObjectId;
  order_id?: mongoose.Types.ObjectId;
  reservation_id?: mongoose.Types.ObjectId;
  branch_id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  is_approved: boolean;
}

const ReviewSchema: Schema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  reservation_id: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  is_approved: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<IReview>('Review', ReviewSchema);
