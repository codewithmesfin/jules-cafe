import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  customer_id: mongoose.Types.ObjectId;
  branch_id: mongoose.Types.ObjectId;
  company_id?: mongoose.Types.ObjectId;
  table_id?: mongoose.Types.ObjectId;
  waiter_id?: mongoose.Types.ObjectId;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  status: 'requested' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
  note: string;
  client_request_id?: string;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const ReservationSchema: Schema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company' },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table' },
  waiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  reservation_date: { type: String, required: true },
  reservation_time: { type: String, required: true },
  guests_count: { type: Number, required: true },
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'seated', 'cancelled', 'no_show'],
    default: 'requested'
  },
  note: { type: String },
  client_request_id: { type: String, unique: true, sparse: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
