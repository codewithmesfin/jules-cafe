export type UserRole = 'admin' | 'manager' | 'cashier' | 'customer';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  branch_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  capacity: number;
  is_active: boolean;
}

export interface Table {
  id: string;
  branch_id: string;
  table_number: string;
  capacity: number;
  is_active: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  is_active: boolean;
  image_url: string;
  created_at: string;
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_modifier: number;
  is_active: boolean;
}

export interface BranchMenuItem {
  id: string;
  branch_id: string;
  menu_item_id: string;
  is_available: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  branch_id: string;
  customer_id: string;
  table_id?: string | null;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Reservation {
  id: string;
  branch_id: string;
  customer_id: string;
  date: string;
  time: string;
  number_of_people: number;
  status: ReservationStatus;
  note: string;
  created_at: string;
}

export interface Review {
  id: string;
  branch_id: string;
  customer_id: string;
  order_id?: string | null;
  rating: number; // 1-5
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: string;
  module: string;
  can_read: boolean;
  can_write: boolean;
  can_approve: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export interface StockItem {
  id: string;
  ingredient_id: string;
  quantity: number;
  min_stock_level: number;
  updated_at: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  ingredients: RecipeIngredient[];
}
