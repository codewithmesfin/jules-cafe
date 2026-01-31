export type UserRole = 'admin' | 'manager' | 'cashier' | 'customer' | 'staff';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  branch_id?: string; // Optional for admin, required for others
  customer_type?: 'regular' | 'vip' | 'member';
  discount_rate?: number; // percentage, e.g. 10 for 10%
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  operating_hours: {
    open: string;
    close: string;
  };
  capacity: number;
}

export interface Table {
  id: string;
  branch_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
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
  image_url: string;
  is_active: boolean; // Global visibility
  created_at: string;
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_override?: number;
}

export interface BranchMenuItem {
  id: string;
  branch_id: string;
  menu_item_id: string;
  is_available: boolean;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'walk-in' | 'self-service';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  branch_id: string;
  table_id?: string;
  waiter_id?: string;
  status: OrderStatus;
  type: OrderType;
  total_amount: number;
  discount_amount?: number;
  created_at: string;
  cancel_reason?: string;
}

export interface OrderItem {
  id: string;
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
  customer_id: string;
  branch_id: string;
  table_id?: string;
  waiter_id?: string;
  reservation_date: string;
  reservation_time: string;
  guests_count: number;
  status: ReservationStatus;
  note: string;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  order_id?: string;
  reservation_id?: string;
  branch_id: string;
  rating: number; // 1-5
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface Report {
  orders_per_branch: { branch_name: string; count: number }[];
  top_selling_items: { item_name: string; count: number }[];
  average_rating_per_branch: { branch_name: string; rating: number }[];
}

export interface InventoryItem {
  id: string;
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
  menu_item_id: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
}
