import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Search, Grid, User, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import type { Product, Category, Table, User as UserType, Customer } from '../../types';

interface CartItem extends Product {
  quantity: number;
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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'other'>('cash');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: '', email: '', phone: '' });

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

        // Handle both response formats (direct array or { success, data })
        setProducts(Array.isArray(prodList) ? prodList : prodList.data || []);
        setCategories(Array.isArray(catList) ? catList : catList.data || []);
        setTables(Array.isArray(tblList) ? tblList : tblList.data || []);
        setCustomers(Array.isArray(custList) ? custList : custList.data || []);

        if (orderId) {
          fetchOrderDetails(orderId, Array.isArray(prodList) ? prodList : prodList.data || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        showNotification(error.message || 'Failed to fetch data', 'error');
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

      const editableStatuses = ['pending', 'accepted', 'preparing'];
      if (!editableStatuses.includes(order.order_status)) {
        showNotification(`Orders in ${order.order_status} status cannot be edited.`, 'warning');
        router.push('/cashier/queue');
        return;
      }

      setSelectedCustomer(order.customer_id?._id || order.customer_id || '');
      setSelectedTable(order.table_id?._id || order.table_id || '');
      setOrderNotes(order.notes || '');
      setPaymentMethod(order.payment_method || 'cash');

      // Fetch order items
      const itemsResponse = await api.orders.getItems(id);
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse.data || [];

      const cartItems: CartItem[] = items.map((item: any) => {
        const product = allProducts.find(p => p.id === (item.product_id?._id || item.product_id) || p._id === (item.product_id?._id || item.product_id));

        if (!product) return null;

        return {
          ...product,
          quantity: item.quantity,
          price: item.price
        };
      }).filter(Boolean) as CartItem[];

      setCart(cartItems);
    } catch (error: any) {
      showNotification(error.message || 'Failed to fetch order details', 'error');
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
  const total = subtotal; // Can add tax/discounts later if needed

  const handlePlaceOrder = async () => {
    try {
      setSaving(true);
      const orderData = {
        customer_id: selectedCustomer || undefined,
        table_id: selectedTable || undefined,
        notes: orderNotes,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id || item._id,
          quantity: item.quantity
        }))
      };

      if (orderId) {
        await api.orders.update(orderId, orderData);
        showNotification("Order updated successfully!");
        router.push('/cashier/queue');
      } else {
        await api.orders.create(orderData);
        showNotification("Order placed successfully!");
        setCart([]);
        setSelectedCustomer('');
        setSelectedTable('');
        setOrderNotes('');
        setIsCartDrawerOpen(false);
      }
    } catch (error: any) {
      showNotification(error.message || `Failed to ${orderId ? 'update' : 'place'} order`, "error");
    } finally {
      setSaving(false);
    }
  };

  const cartContent = (
    <div className="flex flex-col h-full flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            <Grid size={12} /> Table
          </label>
          <select
            className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 px-3 py-2.5 focus:ring-blue-500 focus:border-blue-500"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Walk-in / No Table</option>
            {tables.map(t => (
              <option key={t.id || t._id} value={t.id || t._id}>Table {t.table_number} ({t.capacity} seats)</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            <User size={12} className="text-blue-600" /> Customer
          </label>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 text-sm border-slate-200 rounded-xl bg-slate-50 px-3 py-2.5 focus:ring-blue-500 focus:border-blue-500 font-medium"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Guest Customer</option>
              {customers.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.full_name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-100 transition-colors"
              title="Add New Customer"
            >
              <UserPlus size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'card', 'mobile', 'other'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "py-2 text-xs font-bold rounded-lg border transition-all capitalize",
                  paymentMethod === method
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-200"
                )}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <textarea
            className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Order notes (customizations, allergies...)"
            rows={2}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-10">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <ShoppingCart size={48} strokeWidth={1.5} />
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs">Select products to start your order</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id || item._id} className="flex justify-between items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-blue-600 font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-full px-2 py-1 shadow-sm">
                <button
                  onClick={() => updateQuantity((item.id || item._id)!, -1)}
                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity((item.id || item._id)!, 1)}
                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sticky bottom-0 p-6 bg-slate-50 border-t border-slate-100 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
        <Button
          className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-100 rounded-2xl"
          size="lg"
          disabled={cart.length === 0 || saving}
          onClick={handlePlaceOrder}
        >
          {saving ? 'Processing...' : orderId ? 'Update Order' : 'Complete Sale'}
        </Button>
      </div>
    </div>
  );

  if (orderLoading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Loading order details...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative pb-24 lg:pb-0">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header Actions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            {orderId && (
              <button
                onClick={() => router.push('/cashier/queue')}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-black text-slate-900 truncate">
              {orderId ? `Editing Order #${orderId.slice(-4)}` : 'New Sale'}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                placeholder="Search products by name..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden xl:block w-64">
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
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

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border shrink-0",
                selectedCategory === 'all'
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
              )}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id || cat._id}
                onClick={() => setSelectedCategory((cat.id || cat._id)!)}
                className={cn(
                  "whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border shrink-0",
                  selectedCategory === (cat.id || cat._id)
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6 no-scrollbar">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-64" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
              <div className="p-6 bg-slate-50 rounded-full">
                <Search size={48} strokeWidth={1} />
              </div>
              <p className="font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map(product => (
                <div
                  key={product.id || product._id}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col active:scale-95"
                  onClick={() => addToCart(product)}
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-slate-50">
                    {product.image_url ? (
                      <img
                        src={product.image_url || undefined}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:text-blue-300 transition-colors">
                        <Grid size={48} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
                        <Plus size={18} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-1">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                    {product.description && <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mb-2 min-h-[2.5em]">{product.description}</p>}
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-slate-50">
                      <span className="font-black text-blue-600 text-base">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Order Panel */}
      <aside className="hidden lg:flex w-96 shrink-0 flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 h-full overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight">Order Details</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Transaction</p>
            </div>
          </div>
        </div>
        {cartContent}
      </aside>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 flex items-center gap-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex-1">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Total Amount</p>
          <p className="text-2xl font-black text-blue-600">${total.toFixed(2)}</p>
        </div>
        <button
          className="bg-blue-600 text-white px-8 h-14 rounded-2xl flex items-center gap-3 font-black shadow-lg shadow-blue-100 relative active:scale-95 transition-transform"
          onClick={() => setIsCartDrawerOpen(true)}
        >
          <ShoppingCart size={20} />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-4 border-white">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      <Drawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        title="Current Order"
      >
        <div className="h-[calc(100vh-140px)]">
          {cartContent}
        </div>
      </Drawer>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="New Customer Registration"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl" onClick={async () => {
              try {
                await api.customers.create(newCustomer);
                showNotification("Customer registered successfully!");
                setIsCustomerModalOpen(false);
                const custList = await api.customers.getAll();
                setCustomers(Array.isArray(custList) ? custList : custList.data || []);
              } catch (error: any) {
                showNotification(error.message || "Failed to register customer", "error");
              }
            }}>Register Customer</Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Full Name"
            placeholder="Enter customer name"
            value={newCustomer.full_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
            className="rounded-xl"
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +251..."
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            className="rounded-xl"
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. john@example.com"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            className="rounded-xl"
          />
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
