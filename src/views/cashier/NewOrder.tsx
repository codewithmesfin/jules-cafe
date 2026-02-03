"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Plus, Minus, Search, Grid, User, ArrowLeft,
  Utensils, Package, Coffee, Pizza, ChefHat, Truck, ChevronRight
} from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '../../utils/cn';
import type { Product, Category, Table, Customer } from '../../types';

interface CartItem extends Product {
  quantity: number;
}

type OrderType = 'dine-in' | 'takeaway' | 'delivery';

const categoryColors: Record<string, string> = {
  Pizza: 'bg-amber-100 text-amber-700',
  Burger: 'bg-orange-100 text-orange-700',
  Pasta: 'bg-yellow-100 text-yellow-700',
  Drinks: 'bg-blue-100 text-blue-700',
  Dessert: 'bg-pink-100 text-pink-700',
  default: 'bg-slate-100 text-slate-700',
};

const categoryIcons: Record<string, React.ElementType> = {
  Pizza: Pizza,
  Burger: ChefHat,
  Pasta: Utensils,
  Drinks: Coffee,
  default: Package,
};

const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodList, catList, tblList, custList] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll(),
          api.tables.getAll(),
          api.customers.getAll(),
        ]);

        setProducts(Array.isArray(prodList) ? prodList : prodList.data || []);
        setCategories(Array.isArray(catList) ? catList : catList.data || []);
        setTables(Array.isArray(tblList) ? tblList : tblList.data || []);
        setCustomers(Array.isArray(custList) ? custList : custList.data || []);

        if (orderId) {
          fetchOrderDetails(orderId, Array.isArray(prodList) ? prodList : prodList.data || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        showNotification('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const fetchOrderDetails = async (id: string, allProducts: Product[]) => {
    try {
      setOrderLoading(true);
      const orderResponse = await api.orders.getOne(id);
      const order = orderResponse.data || orderResponse;

      setOrderType((order.order_type as OrderType) || 'dine-in');
      setSelectedCustomer(order.customer_id as any);
      setOrderNotes(order.notes || '');

      const itemsResponse = await api.orders.getItems(id);
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse.data || [];

      const cartItems: CartItem[] = items.map((item: any) => {
        const product = allProducts.find(p => p.id === (item.product_id?._id || item.product_id) || p._id === (item.product_id?._id || item.product_id));
        if (!product) return null;
        return { ...product, quantity: item.quantity, price: item.price };
      }).filter(Boolean) as CartItem[];

      setCart(cartItems);
    } catch (error: any) {
      showNotification('Failed to load order', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory && item.is_active;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id || i._id === product._id);
      if (existing) {
        return prev.map(i => (i.id === product.id || i._id === product._id) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id || item._id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    try {
      setSaving(true);
      const orderData = {
        order_type: orderType,
        customer_id: selectedCustomer?.id || selectedCustomer?._id,
        table_id: selectedTable?.id || selectedTable?._id,
        notes: orderNotes,
        items: cart.map(item => ({
          product_id: item.id || item._id,
          quantity: item.quantity
        }))
      };

      if (orderId) {
        await api.orders.update(orderId, orderData);
        showNotification('Order updated successfully!');
        router.push('/orders?mode=queue');
      } else {
        await api.orders.create(orderData);
        showNotification('Order placed successfully!');
        setCart([]);
        setSelectedTable(null);
        setSelectedCustomer(null);
        setOrderNotes('');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get table name/number
  const getTableDisplayName = (table: Table): string => {
    return table.table_number || table.name || 'Unknown';
  };

  // Helper to get table seats
  const getTableSeats = (table: Table): number => {
    return table.seats || table.capacity || 0;
  };

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            {orderId && (
              <button
                onClick={() => router.push('/orders?mode=queue')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-900">
              {orderId ? `Edit Order #${orderId.slice(-4)}` : 'New Order'}
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all',
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || categoryIcons.default;
              const style = categoryColors[cat.name] || categoryColors.default;
              return (
                <button
                  key={cat.id || cat._id}
                  onClick={() => setSelectedCategory(cat.id || cat._id!)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2',
                    selectedCategory === (cat.id || cat._id)
                      ? 'bg-slate-900 text-white'
                      : `${style} hover:opacity-80`
                  )}
                >
                  <Icon size={16} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Search size={48} strokeWidth={1} />
              <p className="mt-4 font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredItems.map((product) => (
                <button
                  key={product.id || product._id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Grid size={32} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-slate-900 text-sm truncate">{product.name}</h4>
                  <p className="text-lg font-bold text-slate-900 mt-1">${product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Cart Panel */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
        {/* Order Type Tabs */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex gap-2">
            {[
              { type: 'dine-in' as const, icon: Utensils, label: 'Dine In' },
              { type: 'takeaway' as const, icon: Package, label: 'Pickup' },
              { type: 'delivery' as const, icon: Truck, label: 'Delivery' },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all',
                  orderType === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Selection (for Dine-in) */}
        {orderType === 'dine-in' && (
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={() => setShowTableSelector(true)}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Utensils size={20} className="text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-slate-900">
                  {selectedTable ? `Table ${getTableDisplayName(selectedTable)}` : 'Select Table'}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedTable ? `${getTableSeats(selectedTable)} seats` : 'Choose a table'}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        )}

        {/* Customer */}
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <User size={20} className="text-slate-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-900">
                {selectedCustomer ? selectedCustomer.full_name : 'Customer'}
              </p>
              <p className="text-sm text-slate-500">
                {selectedCustomer ? selectedCustomer.phone : 'Add customer'}
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ShoppingCart size={40} strokeWidth={1} />
              <p className="mt-2 font-medium">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id || item._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id || item._id!, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={12} className="text-slate-600" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id || item._id!, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={12} className="text-slate-600" />
                    </button>
                  </div>
                  <p className="w-16 text-right font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <textarea
              placeholder="Notes..."
              className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        )}

        {/* Totals & Action */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full h-12 text-base font-semibold"
            disabled={cart.length === 0 || saving}
            onClick={handlePlaceOrder}
          >
            {saving ? 'Processing...' : orderId ? 'Update Order' : 'Place Order'}
          </Button>
        </div>
      </div>

      {/* Table Selector Modal */}
      <Modal
        isOpen={showTableSelector}
        onClose={() => setShowTableSelector(false)}
        title="Select Table"
        size="2xl"
      >
        <div className="grid grid-cols-5 gap-4 p-4">
          {tables.map((table) => {
            const isSelected = selectedTable?.id === table.id || selectedTable?._id === table._id;
            return (
              <button
                key={table.id || table._id}
                onClick={() => {
                  setSelectedTable(table);
                  setShowTableSelector(false);
                }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  isSelected
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2',
                  table.status === 'available' ? 'bg-emerald-100 text-emerald-600' :
                  table.status === 'occupied' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                )}>
                  <Grid size={24} />
                </div>
                <p className="font-semibold text-slate-900">Table {getTableDisplayName(table)}</p>
                <p className="text-sm text-slate-500">{getTableSeats(table)} seats</p>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Customer Selector Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Select Customer"
        size="lg"
      >
        <div className="p-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-4 py-2 bg-slate-50 border-0 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id || customer._id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerModal(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-semibold text-slate-700">
                  {(customer.full_name || 'U').charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{customer.full_name}</p>
                  <p className="text-sm text-slate-500">{customer.phone || 'No phone'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewOrder;
