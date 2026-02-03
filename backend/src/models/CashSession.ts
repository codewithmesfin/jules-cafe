import mongoose, { Schema, Document } from 'mongoose';

export interface ICashSession extends Document {
  business_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId; // The person who opened the session
  opening_balance: number;
  closing_balance?: number;
  expected_balance?: number; // Calculated from sales
  difference?: number; // closing - expected
  status: 'open' | 'closed';
  opened_at: Date;
  closed_at?: Date;
  notes?: string;
}

const CashSessionSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opening_balance: { type: Number, default: 0 },
  closing_balance: { type: Number },
  expected_balance: { type: Number },
  difference: { type: Number },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  opened_at: { type: Date, default: Date.now },
  closed_at: { type: Date },
  notes: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<ICashSession>('CashSession', CashSessionSchema);
