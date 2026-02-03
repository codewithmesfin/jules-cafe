import mongoose, { Schema, Document } from 'mongoose';

/**
 * Company Model - First-class tenant entity
 * Each company represents a tenant in the multi-tenant SaaS system
 */
export interface ICompany extends Document {
  // Core identification
  name: string;
  legal_name?: string;
  description?: string;
  category?: 'cafe' | 'restaurant' | 'coffee_shop' | 'bar' | 'bakery' | 'other';
  
  // Contact information
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  
  // Branding
  logo?: string;
  favicon?: string;
  primary_color?: string;
  
  // Tenant settings
  settings: {
    currency: string;
    timezone: string;
    date_format: string;
    fiscal_year_start: number;
    language: string;
  };
  
  // Subscription & limits
  subscription: {
    plan: 'trial' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended' | 'cancelled';
    max_branches: number;
    max_users: number;
    max_menu_items: number;
    trial_ends_at?: Date;
    subscribed_at?: Date;
  };
  
  // Status
  is_active: boolean;
  setup_completed: boolean;
  setup_step?: string;
  
  // Audit
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  legal_name: { type: String, trim: true },
  description: { type: String },
  category: { 
    type: String,
    enum: ['cafe', 'restaurant', 'coffee_shop', 'bar', 'bakery', 'other']
  },
  
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  
  logo: { type: String },
  favicon: { type: String },
  primary_color: { type: String, default: '#f97316' },
  
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    date_format: { type: String, default: 'YYYY-MM-DD' },
    fiscal_year_start: { type: Number, default: 1 },
    language: { type: String, default: 'en' }
  },
  
  subscription: {
    plan: { 
      type: String, 
      enum: ['trial', 'starter', 'professional', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    max_branches: { type: Number, default: 1 },
    max_users: { type: Number, default: 5 },
    max_menu_items: { type: Number, default: 50 },
    trial_ends_at: Date,
    subscribed_at: Date
  },
  
  is_active: { type: Boolean, default: true },
  setup_completed: { type: Boolean, default: false },
  setup_step: { type: String },
  
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'companies'
});

// Indexes for efficient queries
CompanySchema.index({ name: 'text' });
CompanySchema.index({ 'subscription.plan': 1 });
CompanySchema.index({ is_active: 1 });
CompanySchema.index({ created_at: -1 });

export default mongoose.model<ICompany>('Company', CompanySchema);
