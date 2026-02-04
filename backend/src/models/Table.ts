import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  creator_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  name: string;
  seats: number;
  location?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const TableSchema: Schema = new Schema({
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  seats: { type: Number, required: true },
  location: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

TableSchema.index({ business_id: 1, name: 1 });

export default mongoose.model<ITable>('Table', TableSchema);
