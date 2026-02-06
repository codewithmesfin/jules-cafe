import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  business_id: mongoose.Types.ObjectId;
  plan: 'standard' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: Date;
  end_date: Date;
  billing_cycle: 'monthly' | 'yearly';
  daily_rate: number;
  created_at: Date;
  updated_at: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  business_id: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  plan: {
    type: String,
    enum: ['standard', 'basic', 'pro', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'pending'
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  billing_cycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  daily_rate: {
    type: Number,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
