"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Plus, Minus, Search, Grid, User, ArrowLeft, UserPlus
} from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '../../utils/cn';
import type { Product, Category, Table, User as AppUser, Customer } from '../../types';

interface CartItem extends Product {
  quantity: number;
  base_price: number;
}

const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const [orderNotes, setOrderNotes] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', type: 'regular' as 'regular' | 'vip' | 'member', discount: 0 });

  const rootRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState('100%');

  // Handle dynamic height for desktop, simpler for mobile
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          setDynamicHeight('100dvh');
        } else if (rootRef.current) {
          const topOffset = rootRef.current.getBoundingClientRect().top;
          const bottomPadding = 24;
          setDynamicHeight(`calc(100vh - ${topOffset + bottomPadding}px)`);
        }
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [orderId]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodList, catList, tblList, usrList, custList] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll(),
          api.tables.getAll(),
          api.users.getAll(),
          api.customers.getAll(),
        ]);

        const getArray = (response: any) => Array.isArray(response) ? response : response.data || [];

        setProducts(getArray(prodList));
        setCategories(getArray(catList));
        setTables(getArray(tblList));
        setUsers(getArray(usrList));
        setCustomers(getArray(custList));

        if (orderId) {
          fetchOrderDetails(orderId, getArray(prodList));
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

      setSelectedTable(order.table_id?._id || order.table_id || '');
      setSelectedCustomer(order.customer_id?._id || order.customer_id || '');
      setSelectedWaiter(order.waiter_id?._id || order.waiter_id || '');
      setOrderNotes(order.notes || '');

      const itemsResponse = await api.orders.getItems(id);
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse.data || [];

      const cartItems: CartItem[] = items.map((item: any) => {
        const product = allProducts.find(p => p.id === (item.product_id?._id || item.product_id) || p._id === (item.product_id?._id || item.product_id));
        if (!product) return null;
        return { ...product, quantity: item.quantity, base_price: item.price };
      }).filter(Boolean) as CartItem[];

      setCart(cartItems);
    } catch (error: any) {
      showNotification('Failed to load order: ' + error.message, 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems = products.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory || (item.category_id as any)?._id === selectedCategory;
    
    return matchesSearch && matchesCategory && item.is_active;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id || i._id === product._id);
      if (existing) {
        return prev.map(i => (i.id === product.id || i._id === product._id) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, base_price: product.price }];
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
  
  const customerData = useMemo(() => {
    if (!selectedCustomer) return null;
    const customer = customers.find(c => c.id === selectedCustomer || c._id === selectedCustomer);
    if (!customer) return null;
    
    return {
        ...customer,
        customer_type: customer.customer_type,
        discount_rate: customer.discount_percent
    };
  }, [selectedCustomer, customers]);

  const subtotal = cart.reduce((acc, item) => acc + item.base_price * item.quantity, 0);
  const discountRate = customerData?.discount_rate || 0;
  const discountAmount = subtotal * (discountRate / 100);
  const total = subtotal - discountAmount;


  const handlePlaceOrder = async () => {
    if (!selectedCustomer) {
        showNotification("Please select a customer.", "error");
        return;
    }
    try {
      setSaving(true);
      const orderData: any = {
        customer_id: selectedCustomer,
        notes: orderNotes,
        discount_percent: discountRate,
        discount_amount: discountAmount,
        total_price: total,
        items: cart.map(item => ({
          product_id: item.id || item._id,
          quantity: item.quantity,
          price: item.base_price,
        }))
      };

      if (selectedTable) orderData.table_id = selectedTable;
      if (selectedWaiter) orderData.waiter_id = selectedWaiter;


      if (orderId) {
        await api.orders.update(orderId, orderData);
        showNotification('Order updated successfully!');
        router.push('/dashboard/orders');
      } else {
        await api.orders.create({
          ...orderData,
          status: 'preparing'
        });
        showNotification('Order placed successfully!');
        setCart([]);
        setSelectedTable('');
        setSelectedCustomer('');
        setSelectedWaiter('');
        setOrderNotes('');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to place order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterCustomer = async () => {
    try {
      const { name, phone, email, type, discount } = newCustomer;
      if (!name || !phone) {
        showNotification("Full Name and Phone are required.", "error");
        return;
      }

      await api.customers.create({
        full_name: name,
        phone,
        email,
        customer_type: type === 'vip' ? 'vip' : type === 'member' ? 'member' : 'regular',
        discount_percent: discount,
      });

      showNotification("Customer added successfully!");
      setIsCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', type: 'regular', discount: 0 });
      const custs = await api.customers.getAll();
      setCustomers(Array.isArray(custs) ? custs : custs.data || []);
    } catch (error: any) {
      showNotification(error.message || "Failed to add customer", "error");
    }
  };

  const cartContent = (
    <div className="flex flex-col h-full max-h-[660px] bg-white lg:rounded-b-3xl">
      {/* Form fields and cart items */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1.5">
                <Grid size={12} className="text-[#e60023]" /> Table
              </label>
              <div className="relative">
                <select
                  className="w-full text-xs sm:text-sm appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#e60023] focus:border-transparent transition-all shadow-sm font-medium truncate cursor-pointer"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <option value="">Select Table</option>
                  {tables.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name} ({t.capacity} seats)</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1.5">
                <User size={12} className="text-gray-500" /> Waiter
              </label>
              <div className="relative">
                <select
                  className="w-full text-xs sm:text-sm appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#e60023] focus:border-transparent transition-all shadow-sm font-medium truncate cursor-pointer"
                  value={selectedWaiter}
                  onChange={(e) => setSelectedWaiter(e.target.value)}
                >
                  <option value="">Assign Waiter</option>
                  {users.filter(u => u.role === 'waiter').map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>{u.full_name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#e60023] flex items-center gap-1 mb-1.5">
                <User size={12} /> Customer *
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative flex-1">
                  <select
                    className="w-full text-xs sm:text-sm appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#e60023] focus:border-transparent transition-all shadow-sm font-medium truncate cursor-pointer"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.full_name} ({c.phone})</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="sm:w-auto w-full p-2.5 sm:py-3 bg-[#e60023] text-white hover:bg-[#cc0000] rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:px-4 font-medium"
                  title="Add New Customer"
                >
                  <UserPlus size={16} />
                  <span className="sm:hidden text-sm">Add</span>
                </button>
              </div>
            </div>

            <div>
              <textarea
                className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl bg-white px-3 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#e60023] focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 resize-none"
                placeholder="Notes (special requests, allergies...)"
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Items ({cart.length})</h3>
          </div>
          
          {cart.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={28} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">Add items from the menu to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id || item._id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate pr-2">{item.name}</p>
                    <p className="text-xs text-[#e60023] font-bold mt-0.5">ETB {item.base_price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                    <button
                      onClick={() => updateQuantity(item.id || item._id!, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-[#e60023] rounded-full hover:bg-orange-50 hover:border-orange-200 transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id || item._id!, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-[#e60023] rounded-full hover:bg-orange-50 hover:border-orange-200 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Totals and action */}
      <div className="sticky bottom-0 flex-shrink-0 p-4 sm:p-5 bg-white border-t border-gray-100 space-y-4 lg:rounded-b-3xl">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900">ETB {subtotal.toFixed(2)}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs uppercase">{customerData?.customer_type}</span>
                Discount ({discountRate}%)
              </span>
              <span className="text-green-600 font-semibold">-ETB {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-lg font-black text-gray-900">Total</span>
            <span className="text-xl font-black text-[#e60023]">ETB {total.toFixed(2)}</span>
          </div>
        </div>
        
        <Button
          className="w-full h-12 text-base font-bold shadow-lg shadow-orange-200 bg-gradient-to-r from-[#e60023] to-[#ff3333] hover:from-[#cc0000] hover:to-[#e60023] rounded-xl"
          size="lg"
          disabled={cart.length === 0 || !selectedCustomer || saving}
          onClick={handlePlaceOrder}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : orderId ? (
            'Update Order'
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </div>
  );



  if (orderLoading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#e60023] rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading order details...</p>
    </div>
  );

  return (
    <div ref={rootRef} className="flex flex-col lg:flex-row gap-6 relative min-h-screen lg:min-h-0" style={{ height: typeof window !== 'undefined' && window.innerWidth < 1024 ? '100dvh' : dynamicHeight }}>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            {orderId && (
              <button
                onClick={() => router.push('/dashboard/orders?mode=queue')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e60023] transition-colors w-4 h-4" />
              <input
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e60023] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden xl:block w-64">
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border shrink-0",
                selectedCategory === 'all'
                  ? "bg-[#e60023] border-[#e60023] text-white shadow-md shadow-orange-100 scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50"
              )}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id || cat._id}
                onClick={() => setSelectedCategory(cat.id || cat._id!)}
                className={cn(
                  "whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border shrink-0",
                  selectedCategory === (cat.id || cat._id)
                    ? "bg-[#e60023] border-[#e60023] text-white shadow-md shadow-orange-100 scale-105"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-24 no-scrollbar">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl sm:rounded-2xl h-40 sm:h-48" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4 px-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <p className="font-medium text-sm sm:text-base">No items found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id || item._id}
                  className="group relative bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer flex flex-col active:scale-95 touch-manipulation"
                  onClick={() => addToCart(item)}
                >
                  <div className="relative aspect-square mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl bg-gray-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url || undefined}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-orange-300 transition-colors">
                        <Grid size={32} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                      <div className="bg-white/90 backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-sm">
                        <Plus size={16} className="text-[#e60023]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-[#e60023] transition-colors">{item.name}</h4>
                    {item.description && <p className="text-[10px] text-gray-500 line-clamp-2 hidden sm:block mb-1">{item.description}</p>}
                    <div className="mt-auto pt-1 sm:pt-2 flex justify-between items-center">
                      <span className="font-black text-[#e60023] text-xs sm:text-sm">ETB {item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="hidden lg:flex w-96 shrink-0 flex-col bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/50 h-full overflow-hidden">
        <div className="p-6 bg-[#e60023] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Order Details</h3>
              <p className="text-orange-100 text-xs font-medium uppercase tracking-widest">Cashier Terminal</p>
            </div>
          </div>
          {orderId && (
            <Badge className="bg-white/20 text-white border-none">EDIT</Badge>
          )}
        </div>
        {cartContent}
      </aside>

      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[60] flex items-center gap-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] safe-area-pb">
        <div className="flex-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Total Amount</p>
          <p className="text-2xl font-black text-[#e60023]">ETB {total.toFixed(2)}</p>
        </div>
        <button
          className="bg-[#e60023] text-white px-6 h-12 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-orange-100 relative active:scale-95 transition-transform"
          onClick={() => setIsCartDrawerOpen(true)}
        >
          <ShoppingCart size={18} />
          View Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <Drawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        title="Current Order"
        position="bottom"
      >
        <div className="h-[calc(100dvh-180px)] sm:h-[calc(100vh-140px)] flex flex-col">
          {cartContent}
        </div>
      </Drawer>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Register New Customer"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleRegisterCustomer}>Register Customer</Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +1 234 567 890"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. john@example.com"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">Loyalty Status</label>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] transition-all"
                value={newCustomer.type}
                onChange={(e) => {
                  const type = e.target.value as 'regular' | 'vip' | 'member';
                  let discount = 0;
                  if (type === 'vip') discount = 15;
                  else if (type === 'member') discount = 5;
                  setNewCustomer({ ...newCustomer, type, discount });
                }}
              >
                <option value="regular">Regular Guest</option>
                <option value="member">Member (5% Off)</option>
                <option value="vip">VIP Guest (15% Off)</option>
              </select>
            </div>
            <Input
              label="Custom Discount (%)"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newCustomer.discount || ""}
              onChange={(e) => setNewCustomer({ ...newCustomer, discount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default NewOrder;
