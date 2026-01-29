import type { MenuCategory, MenuItem, User, Order, Reservation, Review, Ingredient, StockItem, Recipe, Branch, Table, MenuVariant, BranchMenuItem } from '../types';

export const MOCK_BRANCHES: Branch[] = [
  { id: '1', name: 'Downtown Main', address: '123 Main St, Cityville', phone: '555-0101', opening_time: '08:00', closing_time: '22:00', capacity: 50, is_active: true },
  { id: '2', name: 'Westside Mall', address: '456 West Ave, Cityville', phone: '555-0102', opening_time: '10:00', closing_time: '21:00', capacity: 30, is_active: true },
];

export const MOCK_TABLES: Table[] = [
  { id: '1', branch_id: '1', table_number: 'T1', capacity: 4, is_active: true },
  { id: '2', branch_id: '1', table_number: 'T2', capacity: 2, is_active: true },
  { id: '3', branch_id: '2', table_number: 'W1', capacity: 4, is_active: true },
];

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'Appetizers', description: 'Start your meal with these tasty treats', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Main Courses', description: 'Hearty and delicious main dishes', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Desserts', description: 'Sweet endings for your meal', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Beverages', description: 'Refreshing drinks and coffees', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', category_id: '1', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs', base_price: 5.99, image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: '2', category_id: '1', name: 'Calamari', description: 'Crispy fried squid with lemon aioli', base_price: 12.50, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: '3', category_id: '2', name: 'Grilled Salmon', description: 'Atlantic salmon with roasted vegetables', base_price: 24.00, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: '4', category_id: '2', name: 'Beef Burger', description: 'Juicy beef patty with cheese, lettuce, and tomato', base_price: 16.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: '5', category_id: '3', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center', base_price: 8.50, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62adda51?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
  { id: '6', category_id: '4', name: 'Fresh Lemonade', description: 'House-made lemonade with mint', base_price: 4.50, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_VARIANTS: MenuVariant[] = [
  { id: '1', menu_item_id: '4', name: 'Double Patty', price_modifier: 4.00, is_active: true },
  { id: '2', menu_item_id: '4', name: 'Extra Cheese', price_modifier: 1.50, is_active: true },
];

export const MOCK_BRANCH_MENU_ITEMS: BranchMenuItem[] = [
  { id: '1', branch_id: '1', menu_item_id: '1', is_available: true },
  { id: '2', branch_id: '1', menu_item_id: '2', is_available: true },
  { id: '3', branch_id: '2', menu_item_id: '1', is_available: true },
];

export const MOCK_USERS: User[] = [
  { id: '1', full_name: 'Admin User', email: 'admin@example.com', phone: '123-456-7890', role: 'admin', status: 'active', is_active: true, created_at: new Date().toISOString() },
  { id: '2', full_name: 'Branch Manager', email: 'manager@example.com', phone: '234-567-8901', role: 'manager', status: 'active', branch_id: '1', is_active: true, created_at: new Date().toISOString() },
  { id: '3', full_name: 'John Customer', email: 'john@example.com', phone: '345-678-9012', role: 'customer', status: 'active', is_active: true, created_at: new Date().toISOString() },
  { id: '4', full_name: 'Alice Cashier', email: 'cashier@example.com', phone: '456-789-0123', role: 'cashier', status: 'active', branch_id: '1', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_ORDERS: Order[] = [
  { id: '1', order_number: 'ORD-001', branch_id: '1', customer_id: '3', status: 'served', total_amount: 32.50, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', order_number: 'ORD-002', branch_id: '1', customer_id: '3', status: 'preparing', total_amount: 18.99, created_at: new Date().toISOString() },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', branch_id: '1', customer_id: '3', date: '2024-06-20', time: '19:00', number_of_people: 4, status: 'approved', note: 'Window seat if possible', created_at: new Date().toISOString() },
];

export const MOCK_REVIEWS: Review[] = [
  { id: '1', branch_id: '1', customer_id: '3', rating: 5, comment: 'Excellent food and service!', order_id: '1', is_approved: true, created_at: new Date().toISOString() },
];

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Garlic', unit: 'kg' },
  { id: '2', name: 'Baguette', unit: 'pcs' },
  { id: '3', name: 'Butter', unit: 'kg' },
  { id: '4', name: 'Squid', unit: 'kg' },
  { id: '5', name: 'Lemon', unit: 'pcs' },
  { id: '6', name: 'Salmon Fillet', unit: 'kg' },
  { id: '7', name: 'Beef Patty', unit: 'pcs' },
];

export const MOCK_STOCK: StockItem[] = [
  { id: '1', ingredient_id: '1', quantity: 5, min_stock_level: 2, updated_at: new Date().toISOString() },
  { id: '2', ingredient_id: '2', quantity: 20, min_stock_level: 10, updated_at: new Date().toISOString() },
  { id: '3', ingredient_id: '3', quantity: 10, min_stock_level: 3, updated_at: new Date().toISOString() },
  { id: '4', ingredient_id: '4', quantity: 8, min_stock_level: 5, updated_at: new Date().toISOString() },
  { id: '5', ingredient_id: '5', quantity: 50, min_stock_level: 15, updated_at: new Date().toISOString() },
  { id: '6', ingredient_id: '6', quantity: 12, min_stock_level: 4, updated_at: new Date().toISOString() },
  { id: '7', ingredient_id: '7', quantity: 30, min_stock_level: 10, updated_at: new Date().toISOString() },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    menu_item_id: '1',
    ingredients: [
      { ingredient_id: '2', quantity: 1 },
      { ingredient_id: '3', quantity: 0.05 },
      { ingredient_id: '1', quantity: 0.01 },
    ]
  },
  {
    id: '2',
    menu_item_id: '2',
    ingredients: [
      { ingredient_id: '4', quantity: 0.2 },
      { ingredient_id: '5', quantity: 0.5 },
    ]
  },
];
