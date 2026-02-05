import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BankAccountSchema = new Schema<IBankAccount>({
  bank_name: {
    type: String,
    required: true
  },
  account_number: {
    type: String,
    required: true,
    unique: true
  },
  account_name: {
    type: String,
    required: true
  },
  branch: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
