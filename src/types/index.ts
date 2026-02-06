export type UserRole = 'saas_admin' | 'admin' | 'manager' | 'cashier' | 'waiter';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'onboarding';

export type CustomerType = 'regular' | 'member' | 'staff' | 'vip' | 'wholesale';

export interface User {
  id: string;
  _id?: string;
  full_name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  default_business_id?: string | Business;
  businesses?: Business[];
  is_active: boolean;
  created_at: string;
  // Business subscription status
  businessInactive?: boolean;
  subscriptionExpired?: boolean;
  subscriptionPending?: boolean;
  businessDeactivated?: boolean;
}

export interface Business {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  legal_name?: string;
  description?: string;
  address?: string;
  logo?: string;
  banner?: string;
  owner_id?: string;
  is_active?: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  _id?: string;
  business_id: string;
  category_id: string;
  creator_id?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  image_url?: string;
  sku?: string;
  status?: 'draft' | 'published' | 'out_of_stock';
  is_active: boolean;
}

export interface Ingredient {
  id: string;
  _id?: string;
  business_id: string;
  creator_id?: string;
  name: string;
  unit: string;
  cost_per_unit?: number;
  sku?: string;
  is_active?: boolean;
}

export interface Category {
  id: string;
  _id?: string;
  business_id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Inventory {
  id: string;
  _id?: string;
  business_id: string;
  item_id: string | Ingredient | Product;
  item_type: 'ingredient' | 'product';
  quantity_available: number;
  reorder_level: number;
  created_at: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: string;
  _id?: string;
  business_id: string;
  item_id: string | Ingredient | Product;
  item_type: 'ingredient' | 'product';
  change_quantity: number;
  reference_type: 'purchase' | 'sale' | 'waste' | 'adjustment' | 'production';
  reference_id?: string;
  note?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  _id?: string;
  business_id: string;
  product_id: string;
  ingredient_id: string | Ingredient;
  quantity_required: number;
}

export interface Table {
  id: string;
  _id?: string;
  business_id: string;
  creator_id?: string;
  name: string;
  table_number?: string;
  seats: number;
  capacity?: number;
  location?: string;
  status?: 'available' | 'occupied' | 'reserved';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  _id?: string;
  business_id: string;
  creator_id: string;
  customer_id?: string | Customer;
  table_id?: string;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  order_status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  total_amount: number;
  discount_percent: number;
  discount_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method?: 'cash' | 'card' | 'mobile' | 'other';
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  _id?: string;
  order_id: string;
  product_id: string | Product;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  _id?: string;
  business_id: string;
  creator_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  customer_type: CustomerType;
  discount_percent: number;
  loyalty_points: number;
  total_spent: number;
  last_visit?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface UnitConversion {
  id: string;
  _id?: string;
  from_unit: string;
  to_unit: string;
  factor: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type SubscriptionPlan = 'standard' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'past_due' | 'expired' | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Subscriber {
  id: string;
  _id?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  paymentStatus: PaymentStatus;
  lastPaymentDate?: Date;
  amount: number;
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriberId: string;
  businessName: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceDate: Date;
  dueDate: Date;
  paymentMethod?: 'bank_transfer' | 'card' | 'mobile' | 'cash';
  bankAccount?: BankAccount;
  paymentProofUrl?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  branch?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limitations: string[];
  recommended?: boolean;
}
