export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
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
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
}

export type ReservationStatus = 'requested' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';

export interface Reservation {
  id: string;
  customer_id: string;
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
  rating: number; // 1-5
  comment: string;
  order_id: string | null;
  reservation_id: string | null;
  is_visible: boolean;
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
