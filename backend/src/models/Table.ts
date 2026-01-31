import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  branch_id: mongoose.Types.ObjectId;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

const TableSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  table_number: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<ITable>('Table', TableSchema);
