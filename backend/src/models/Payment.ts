import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  invoice_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
  amount: number;
  bank_account: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  payment_method: 'bank_transfer';
  transaction_reference: string;
  payer_name: string;
  payer_phone: string;
  payer_email: string;
  proof_document?: string;
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  notes?: string;
  verified_by?: mongoose.Types.ObjectId;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const PaymentSchema = new Schema<IPayment>({
  invoice_id: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  business_id: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bank_account: {
    bank_name: {
      type: String,
      required: true
    },
    account_number: {
      type: String,
      required: true
    },
    account_name: {
      type: String,
      required: true
    }
  },
  payment_method: {
    type: String,
    enum: ['bank_transfer'],
    default: 'bank_transfer'
  },
  transaction_reference: {
    type: String,
    required: true
  },
  payer_name: {
    type: String,
    required: true
  },
  payer_phone: {
    type: String
  },
  payer_email: {
    type: String
  },
  proof_document: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  verified_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
