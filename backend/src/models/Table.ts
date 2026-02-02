import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  branch_id: mongoose.Types.ObjectId;
  company_id?: mongoose.Types.ObjectId;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const TableSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company' },
  table_number: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<ITable>('Table', TableSchema);
