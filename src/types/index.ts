export type UserRole = 'saas_admin' | 'admin' | 'manager' | 'cashier' | 'waiter';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'onboarding';

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
  created_at: string;
}

export interface Product {
  id: string;
  _id?: string;
  business_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface Ingredient {
  id: string;
  _id?: string;
  business_id: string;
  name: string;
  unit: string;
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
  ingredient_id: string | Ingredient;
  quantity_available: number;
  reorder_level: number;
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
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Order {
  id: string;
  _id?: string;
  business_id: string;
  creator_id: string;
  customer_id?: string;
  table_id?: string;
  order_status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  total_amount: number;
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
  full_name: string;
  email?: string;
  phone?: string;
  loyalty_points: number;
  total_spent: number;
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
