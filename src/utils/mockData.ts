import type {
  MenuCategory,
  MenuItem,
  MenuVariant,
  Branch,
  Table,
  BranchMenuItem,
  User,
  Order,
  OrderItem,
  Reservation,
  Review
} from '../types';

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Downtown Branch',
    location: '123 Main St, Downtown',
    is_active: true,
    operating_hours: { open: '08:00', close: '22:00' },
    capacity: 50
  },
  {
    id: 'b2',
    name: 'Westside Branch',
    location: '456 West Ave, Westside',
    is_active: true,
    operating_hours: { open: '10:00', close: '23:00' },
    capacity: 30
  },
];

export const MOCK_TABLES: Table[] = [
  { id: 't1', branch_id: 'b1', table_number: '1', capacity: 2, status: 'available' },
  { id: 't2', branch_id: 'b1', table_number: '2', capacity: 4, status: 'occupied' },
  { id: 't3', branch_id: 'b2', table_number: '1', capacity: 4, status: 'available' },
];

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'c1', name: 'Appetizers', description: 'Start your meal with these tasty treats', is_active: true, created_at: new Date().toISOString() },
  { id: 'c2', name: 'Main Courses', description: 'Hearty and delicious main dishes', is_active: true, created_at: new Date().toISOString() },
  { id: 'c3', name: 'Desserts', description: 'Sweet endings for your meal', is_active: true, created_at: new Date().toISOString() },
  { id: 'c4', name: 'Beverages', description: 'Refreshing drinks and coffees', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', category_id: 'c1', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs', base_price: 5.99, image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: 'm2', category_id: 'c1', name: 'Calamari', description: 'Crispy fried squid with lemon aioli', base_price: 12.50, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: 'm3', category_id: 'c2', name: 'Grilled Salmon', description: 'Atlantic salmon with roasted vegetables', base_price: 24.00, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: 'm4', category_id: 'c2', name: 'Beef Burger', description: 'Juicy beef patty with cheese, lettuce, and tomato', base_price: 16.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_MENU_VARIANTS: MenuVariant[] = [
  { id: 'v1', menu_item_id: 'm4', name: 'Double Patty', price_override: 21.99 },
  { id: 'v2', menu_item_id: 'm4', name: 'With Bacon', price_override: 18.50 },
];

export const MOCK_BRANCH_MENU_ITEMS: BranchMenuItem[] = [
  { id: 'bm1', branch_id: 'b1', menu_item_id: 'm1', is_available: true },
  { id: 'bm2', branch_id: 'b1', menu_item_id: 'm2', is_available: true },
  { id: 'bm3', branch_id: 'b1', menu_item_id: 'm3', is_available: true },
  { id: 'bm4', branch_id: 'b1', menu_item_id: 'm4', is_available: true },
  { id: 'bm5', branch_id: 'b2', menu_item_id: 'm1', is_available: true },
  { id: 'bm6', branch_id: 'b2', menu_item_id: 'm3', is_available: false },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', full_name: 'Admin User', email: 'admin@example.com', phone: '123-456-7890', role: 'admin', status: 'active', created_at: new Date().toISOString() },
  { id: 'u2', full_name: 'Manager User', email: 'manager@example.com', phone: '234-567-8901', role: 'manager', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
  { id: 'u3', full_name: 'Cashier User', email: 'cashier@example.com', phone: '345-678-9012', role: 'cashier', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
  { id: 'u4', full_name: 'John Customer', email: 'john@example.com', phone: '456-789-0123', role: 'customer', status: 'active', created_at: new Date().toISOString() },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'o1', order_number: 'ORD-001', customer_id: 'u4', branch_id: 'b1', status: 'completed', type: 'self-service', total_amount: 32.50, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'o2', order_number: 'ORD-002', customer_id: 'u4', branch_id: 'b1', status: 'preparing', type: 'self-service', total_amount: 18.99, created_at: new Date().toISOString() },
];

export const MOCK_ORDER_ITEMS: OrderItem[] = [
  { id: 'oi1', order_id: 'o1', menu_item_id: 'm1', menu_item_name: 'Garlic Bread', quantity: 1, unit_price: 5.99 },
  { id: 'oi2', order_id: 'o1', menu_item_id: 'm3', menu_item_name: 'Grilled Salmon', quantity: 1, unit_price: 24.00 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', customer_id: 'u4', branch_id: 'b1', reservation_date: '2024-06-20', reservation_time: '19:00', guests_count: 4, status: 'confirmed', note: 'Window seat if possible', created_at: new Date().toISOString() },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'rv1', customer_id: 'u4', branch_id: 'b1', rating: 5, comment: 'Excellent food and service!', order_id: 'o1', is_approved: true, created_at: new Date().toISOString() },
];
