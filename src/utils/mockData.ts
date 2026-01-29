import type { MenuCategory, MenuItem, User, Order, Reservation, Review } from '../types';

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'Appetizers', description: 'Start your meal with these tasty treats', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Main Courses', description: 'Hearty and delicious main dishes', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Desserts', description: 'Sweet endings for your meal', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Beverages', description: 'Refreshing drinks and coffees', is_active: true, created_at: new Date().toISOString() },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', category_id: '1', name: 'Garlic Bread', description: 'Toasted baguette with garlic butter and herbs', price: 5.99, image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
  { id: '2', category_id: '1', name: 'Calamari', description: 'Crispy fried squid with lemon aioli', price: 12.50, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
  { id: '3', category_id: '2', name: 'Grilled Salmon', description: 'Atlantic salmon with roasted vegetables', price: 24.00, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
  { id: '4', category_id: '2', name: 'Beef Burger', description: 'Juicy beef patty with cheese, lettuce, and tomato', price: 16.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
  { id: '5', category_id: '3', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center', price: 8.50, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62adda51?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
  { id: '6', category_id: '4', name: 'Fresh Lemonade', description: 'House-made lemonade with mint', price: 4.50, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', is_available: true, created_at: new Date().toISOString() },
];

export const MOCK_USERS: User[] = [
  { id: '1', full_name: 'Admin User', email: 'admin@example.com', phone: '123-456-7890', role: 'admin', status: 'active', created_at: new Date().toISOString() },
  { id: '2', full_name: 'Staff Member', email: 'staff@example.com', phone: '234-567-8901', role: 'staff', status: 'active', created_at: new Date().toISOString() },
  { id: '3', full_name: 'John Customer', email: 'john@example.com', phone: '345-678-9012', role: 'customer', status: 'active', created_at: new Date().toISOString() },
];

export const MOCK_ORDERS: Order[] = [
  { id: '1', order_number: 'ORD-001', customer_id: '3', status: 'completed', total_amount: 32.50, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', order_number: 'ORD-002', customer_id: '3', status: 'preparing', total_amount: 18.99, created_at: new Date().toISOString() },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', customer_id: '3', reservation_date: '2024-06-20', reservation_time: '19:00', guests_count: 4, status: 'confirmed', note: 'Window seat if possible', created_at: new Date().toISOString() },
];

export const MOCK_REVIEWS: Review[] = [
  { id: '1', customer_id: '3', rating: 5, comment: 'Excellent food and service!', order_id: '1', reservation_id: null, is_visible: true, created_at: new Date().toISOString() },
];
