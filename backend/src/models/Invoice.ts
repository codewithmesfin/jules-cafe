import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoice_number: string;
  business_id: mongoose.Types.ObjectId;
  subscription_id: mongoose.Types.ObjectId;
  plan: string;
  billing_cycle: 'monthly' | 'yearly';
  days: number;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  discount: number;
  discount_percent: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  period_start: Date;
  period_end: Date;
  due_date: Date;
  paid_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

const InvoiceSchema = new Schema<IInvoice>({
  invoice_number: {
    type: String,
    required: true,
    unique: true,
    default: generateInvoiceNumber
  },
  business_id: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  subscription_id: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  billing_cycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  vat_rate: {
    type: Number,
    default: 15 // 15% VAT
  },
  vat_amount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discount_percent: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  period_start: {
    type: Date,
    required: true
  },
  period_end: {
    type: Date,
    required: true
  },
  due_date: {
    type: Date,
    required: true
  },
  paid_date: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Generate invoice number before saving
InvoiceSchema.pre('save', function(next) {
  if (!this.invoice_number) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.invoice_number = `INV-${year}${month}-${random}`;
  }
  next();
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
