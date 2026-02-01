import type {
  MenuCategory,
  MenuItem,
  Branch,
  Table,
  BranchMenuItem,
  User,
  Order,
  OrderItem,
  Reservation,
  InventoryItem,
  Recipe
} from '../types';

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b1',
    branch_name: 'Downtown Branch',
    location_address: '123 Main St, Downtown',
    is_active: true,
    opening_time: '08:00',
    closing_time: '22:00',
    capacity: 50,
    company: 'c1'
  },
  {
    id: 'b2',
    branch_name: 'Westside Branch',
    location_address: '456 West Ave, Westside',
    is_active: true,
    opening_time: '10:00',
    closing_time: '23:00',
    capacity: 30,
    company: 'c1'
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

export const MOCK_BRANCH_MENU_ITEMS: BranchMenuItem[] = [
  { id: 'bm1', branch_id: 'b1', menu_item_id: 'm1', is_available: true },
  { id: 'bm2', branch_id: 'b1', menu_item_id: 'm2', is_available: true },
  { id: 'bm3', branch_id: 'b1', menu_item_id: 'm3', is_available: true },
  { id: 'bm4', branch_id: 'b1', menu_item_id: 'm4', is_available: true },
  { id: 'bm5', branch_id: 'b2', menu_item_id: 'm1', is_available: true },
  { id: 'bm6', branch_id: 'b2', menu_item_id: 'm3', is_available: false },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', full_name: 'Admin User', email: 'admin@example.com', phone: '123-456-7890', role: 'admin', status: 'active', created_at: new Date().toISOString() },
  { id: 'u2', username: 'manager', full_name: 'Manager User', email: 'manager@example.com', phone: '234-567-8901', role: 'manager', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
  { id: 'u3', username: 'cashier', full_name: 'Cashier User', email: 'cashier@example.com', phone: '345-678-9012', role: 'cashier', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
  { id: 'u4', username: 'john_customer', full_name: 'John Customer', email: 'john@example.com', phone: '456-789-0123', role: 'customer', status: 'active', customer_type: 'vip', discount_rate: 15, created_at: new Date().toISOString() },
  { id: 'u5', username: 'sarah_waiter', full_name: 'Sarah Waiter', email: 'sarah@example.com', phone: '567-890-1234', role: 'staff', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
  { id: 'u6', username: 'mike_waiter', full_name: 'Mike Waiter', email: 'mike@example.com', phone: '678-901-2345', role: 'staff', status: 'active', branch_id: 'b1', created_at: new Date().toISOString() },
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

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', branch_id: 'b1', item_name: 'Flour', category: 'Dry Goods', quantity: 50, unit: 'kg', min_stock: 10, last_updated: new Date().toISOString() },
  { id: 'i2', branch_id: 'b1', item_name: 'Milk', category: 'Dairy', quantity: 12, unit: 'liters', min_stock: 5, last_updated: new Date().toISOString() },
  { id: 'i3', branch_id: 'b1', item_name: 'Eggs', category: 'Dairy', quantity: 120, unit: 'units', min_stock: 30, last_updated: new Date().toISOString() },
  { id: 'i4', branch_id: 'b1', item_name: 'Coffee Beans', category: 'Beverages', quantity: 8, unit: 'kg', min_stock: 2, last_updated: new Date().toISOString() },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    menu_item_id: 'm1', // Garlic Bread
    ingredients: [
      { item_name: 'Flour', quantity: 0.2, unit: 'kg' },
      { item_name: 'Milk', quantity: 0.05, unit: 'liters' },
    ],
    instructions: 'Mix flour and milk to make dough. Bake with garlic butter.'
  },
  {
    id: 'r2',
    menu_item_id: 'm4', // Beef Burger
    ingredients: [
      { item_name: 'Flour', quantity: 0.1, unit: 'kg' },
      { item_name: 'Eggs', quantity: 1, unit: 'units' },
    ],
    instructions: 'Grill beef patty. Serve in bun with fresh toppings.'
  }
];
