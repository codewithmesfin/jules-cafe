export type UserRole = 'admin' | 'manager' | 'cashier' | 'customer' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  _id?: string;
  username?: string;
  full_name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  branch_id?: string;
  company?: string;
  customer_type?: 'regular' | 'vip' | 'member';
  discount_rate?: number;
  created_at: string;
}

export interface Branch {
  id: string;
  _id?: string;
  name?: string; // Alias for branch_name, added by controller factory
  branch_name: string;
  location_address: string;
  is_active: boolean;
  opening_time: string;
  closing_time: string;
  capacity: number;
  company: string;
}

export interface Table {
  id: string;
  _id?: string;
  branch_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface MenuCategory {
  id: string;
  _id?: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  _id?: string;
  item_id?: string; // Reference to Items table
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuVariant {
  id: string;
  _id?: string;
  menu_item_id: string;
  name: string;
  price_override?: number;
}

export interface BranchMenuItem {
  id: string;
  _id?: string;
  branch_id: string;
  menu_item_id: string;
  is_available: boolean;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'walk-in' | 'self-service';

export interface Order {
  id: string;
  _id?: string;
  order_number: string;
  customer_id: string;
  branch_id: string;
  table_id?: string;
  waiter_id?: string;
  status: OrderStatus;
  type: OrderType;
  total_amount: number;
  discount_amount?: number;
  notes?: string;
  created_at: string;
  cancel_reason?: string;
  client_request_id?: string;
}

export interface OrderItem {
  id: string;
  _id?: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
}

export type ReservationStatus = 'requested' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';

export interface Reservation {
  id: string;
  _id?: string;
  customer_id: string;
  branch_id: string;
  table_id?: string;
  waiter_id?: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  status: ReservationStatus;
  note: string;
  client_request_id?: string;
  created_at: string;
}

export interface Report {
  orders_per_branch: { branch_name: string; count: number }[];
  top_selling_items: { item_name: string; count: number }[];
}

export interface InventoryItem {
  id: string;
  _id?: string;
  item_id?: string; // Reference to Items table
  branch_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  last_updated: string;
}

export interface RecipeIngredient {
  item_name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  _id?: string;
  menu_item_id: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
}

export type ItemType = 'menu_item' | 'inventory' | 'ingredient' | 'product' | 'packaging';

export interface Item {
  id: string;
  _id?: string;
  item_name: string;
  item_type: ItemType;
  category?: string;
  unit?: string;
  default_price?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}
