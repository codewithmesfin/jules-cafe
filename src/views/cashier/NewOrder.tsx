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
import type { MenuItem, MenuCategory, Table, User as UserType, Branch } from '../../types';

interface CartItem extends MenuItem {
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
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', type: 'regular' as 'regular' | 'vip' | 'member', discount: 0 });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(() => Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, cats, tbls, usrs, brnchs] = await Promise.all([
          api.menuItems.getAll(),
          api.categories.getAll(),
          api.tables.getAll(),
          api.users.getAll(),
          api.branches.getAll(),
        ]);
        setMenuItems(items);
        setCategories(cats);
        setTables(tbls);
        setUsers(usrs);
        setBranches(brnchs);

        if (orderId) {
          fetchOrderDetails(orderId, items);
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

  const fetchOrderDetails = async (id: string, allMenuItems: MenuItem[]) => {
    try {
      setOrderLoading(true);
      const order = await api.orders.getOne(id);

      const editableStatuses = ['pending', 'accepted', 'preparing'];
      if (!editableStatuses.includes(order.status)) {
        showNotification(`Orders in ${order.status} status cannot be edited.`, 'warning');
        router.push('/cashier/queue');
        return;
      }

      setSelectedCustomer(typeof order.customer_id === 'string' ? order.customer_id : order.customer_id.id);
      setSelectedTable(order.table_id ? (typeof order.table_id === 'string' ? order.table_id : order.table_id.id) : '');
      setSelectedWaiter(order.waiter_id ? (typeof order.waiter_id === 'string' ? order.waiter_id : order.waiter_id.id) : '');
      setOrderNotes(order.notes || '');

      const cartItems: CartItem[] = order.items.map((item: any) => {
        const originalItem = allMenuItems.find(mi => mi.id === item.menu_item_id || (mi as any)._id === item.menu_item_id);

        return {
          id: item.menu_item_id,
          name: item.menu_item_name,
          base_price: item.unit_price,
          quantity: item.quantity,
          description: originalItem?.description || '',
          image_url: originalItem?.image_url || '',
          category_id: originalItem?.category_id || ''
        } as CartItem;
      });
      setCart(cartItems);
    } catch (error: any) {
      showNotification(error.message || 'Failed to fetch order details', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryId = typeof item.category_id === 'string' ? item.category_id : (item.category_id as any)?.id;
    const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const customerData = users.find(u => u.id === selectedCustomer);
  const discountRate = customerData?.discount_rate || 0;
  const subtotal = cart.reduce((acc, item) => acc + item.base_price * item.quantity, 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const total = subtotal - discountAmount;

  const handlePlaceOrder = async () => {
    try {
      setSaving(true);
      const orderData = {
        customer_id: selectedCustomer,
        branch_id: user?.branch_id || (branches.length > 0 ? branches[0].id : ''),
        table_id: selectedTable || undefined,
        waiter_id: selectedWaiter || undefined,
        notes: orderNotes,
        status: 'preparing',
        type: 'walk-in',
        total_amount: total,
        discount_amount: discountAmount,
        items: cart.map(item => ({
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity,
          unit_price: item.base_price
        }))
      };

      if (orderId) {
        await api.orders.update(orderId, orderData);
        showNotification("Order updated successfully!");
        router.push('/cashier/queue');
      } else {
        await api.orders.create({
          ...orderData,
          client_request_id: clientRequestId
        });
        showNotification("Order placed successfully!");
        setCart([]);
        setSelectedCustomer('');
        setSelectedTable('');
        setSelectedWaiter('');
        setOrderNotes('');
        setClientRequestId(Math.random().toString(36).substring(2, 15));
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
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
            <Grid size={12} /> Table
          </label>
          <select
            className="w-full text-sm border-gray-200 rounded-md bg-gray-50 px-3 py-2 focus:ring-[#e60023] focus:border-[#e60023]"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Select Table (Optional)</option>
            {tables.filter(t => {
              const bId = typeof t.branch_id === 'string' ? t.branch_id : (t.branch_id as any)?.id;
              const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
              return bId === userBId;
            }).map(t => (
              <option key={t.id} value={t.id}>Table {t.table_number} ({t.capacity} seats)</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
            <User size={12} /> Waiter
          </label>
          <select
            className="w-full text-sm border-gray-200 rounded-md bg-gray-50 px-3 py-2 focus:ring-[#e60023] focus:border-[#e60023]"
            value={selectedWaiter}
            onChange={(e) => setSelectedWaiter(e.target.value)}
          >
            <option value="">Assign Waiter (Optional)</option>
            {users.filter(u => {
              const bId = typeof u.branch_id === 'string' ? u.branch_id : (u.branch_id as any)?.id;
              const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
              return u.role === 'staff' && bId === userBId;
            }).map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
            <User size={12} className="text-[#e60023]" /> Customer *
          </label>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 text-sm border-gray-200 rounded-md bg-gray-50 px-3 py-2 focus:ring-[#e60023] focus:border-[#e60023] font-medium"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {users.filter(u => u.role === 'customer').map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.phone})</option>
              ))}
            </select>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-2 text-[#e60023] hover:bg-orange-50 rounded-md border border-orange-200 transition-colors"
              title="Add New Customer"
            >
              <UserPlus size={18} />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <textarea
            className="w-full text-xs border border-gray-200 rounded-md p-2 bg-white focus:ring-[#e60023] focus:border-[#e60023]"
            placeholder="Order notes (customizations, allergies...)"
            rows={2}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-10">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <ShoppingCart size={48} strokeWidth={1.5} />
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs">Select items from the menu to start</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex justify-between items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-[#e60023] font-bold">ETB {item.base_price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full px-2 py-1 shadow-sm">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 hover:bg-orange-50 text-[#e60023] rounded-full transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 hover:bg-orange-50 text-[#e60023] rounded-full transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">ETB {subtotal.toFixed(2)}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Discount ({customerData?.customer_type?.toUpperCase()} {discountRate}%)</span>
              <span>-ETB {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-[#e60023]">ETB {total.toFixed(2)}</span>
          </div>
        </div>
        <Button
          className="w-full h-12 text-lg font-bold shadow-lg shadow-orange-200"
          size="lg"
          disabled={cart.length === 0 || !selectedCustomer || saving}
          onClick={handlePlaceOrder}
        >
          {saving ? 'Processing...' : orderId ? 'Update Order' : 'Place Order'}
        </Button>
      </div>
    </div>
  );

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-24 h-24 bg-orange-100 text-[#e60023] rounded-3xl flex items-center justify-center shadow-inner">
          <ShoppingCart size={48} strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900">No Branch Associated</h2>
          <p className="text-gray-500 max-w-sm">
            Please associate this account with a branch to begin creating and managing orders.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/cashier/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  if (orderLoading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#e60023] rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading order details...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative pb-24 lg:pb-0">
      {/* Menu Selection */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header Actions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            {orderId && (
              <button
                onClick={() => router.push('/cashier/queue')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-black text-gray-900 truncate">
              {orderId ? `Editing Order #${orderId.slice(-4)}` : 'Create New Order'}
            </h1>
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
            {/* Desktop Category Dropdown (fallback for wide screens) */}
            <div className="hidden xl:block w-64">
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills (Mobile & Tablet optimized) */}
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
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border shrink-0",
                  selectedCategory === cat.id
                    ? "bg-[#e60023] border-[#e60023] text-white shadow-md shadow-orange-100 scale-105"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6 no-scrollbar">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-56" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <p className="font-medium">No items found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer flex flex-col active:scale-95"
                  onClick={() => addToCart(item)}
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url || undefined}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-orange-300 transition-colors">
                        <Grid size={48} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm">
                        <Plus size={16} className="text-[#e60023]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-[#e60023] transition-colors">{item.name}</h4>
                    {item.description && <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mb-2 min-h-[2.5em]">{item.description}</p>}
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-50">
                      <span className="font-black text-[#e60023] text-base">ETB {item.base_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Panel */}
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

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex items-center gap-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
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
        title="Register New Customer"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={async () => {
              try {
                await api.users.create({
                  ...newCustomer,
                  full_name: newCustomer.name,
                  role: 'customer',
                  status: 'active',
                  branch_id: user?.branch_id,
                  password: 'password123'
                });
                showNotification("Customer added successfully!");
                setIsCustomerModalOpen(false);
                const usrs = await api.users.getAll();
                setUsers(usrs);
              } catch (error: any) {
                showNotification(error.message || "Failed to add customer", "error");
              }
            }}>Register Customer</Button>
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
