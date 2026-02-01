import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Search, Grid, User, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
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

      // Check if editable
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
        branch_id: user?.branch_id || (branches.length > 0 ? branches[0].id : ''), // Fallback if user branch not set
        table_id: selectedTable || undefined,
        waiter_id: selectedWaiter || undefined,
        notes: orderNotes,
        status: 'pending',
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
      }
    } catch (error: any) {
      showNotification(error.message || `Failed to ${orderId ? 'update' : 'place'} order`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <ShoppingCart size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to create orders.
        </p>
      </div>
    );
  }

  if (orderLoading) return <div className="text-center py-20">Loading order details...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-120px)] gap-6 overflow-auto lg:overflow-hidden">
      {/* Menu Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading menu...</div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="p-3 cursor-pointer hover:border-orange-500 transition-colors flex flex-col"
                onClick={() => addToCart(item)}
              >
                {item.image_url ? (
                  <img src={item.image_url || null} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                    <Grid size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-orange-600">${item.base_price.toFixed(2)}</span>
                  <Button size="sm" variant="outline"><Plus size={14} /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart & Checkout */}
      <Card className="w-full lg:w-96 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-600" />
            <h3 className="font-bold text-gray-900">{orderId ? 'Edit Order' : 'Current Order'}</h3>
          </div>
          {orderId && (
            <Button variant="ghost" size="sm" onClick={() => router.push('/cashier/queue')} className="text-gray-500">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          )}
        </div>

        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <Grid size={16} className="text-gray-400" />
            <select
              className="flex-1 text-sm border-none bg-transparent focus:ring-0"
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

          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <select
              className="flex-1 text-sm border-none bg-transparent focus:ring-0"
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

          <div className="flex items-center gap-2">
            <User size={16} className="text-orange-600" />
            <select
              className="flex-1 text-sm border-none bg-transparent focus:ring-0 font-medium"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer *</option>
              {users.filter(u => u.role === 'customer').map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.phone})</option>
              ))}
            </select>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
              title="Add New Customer"
            >
              <UserPlus size={18} />
            </button>
          </div>

          <div className="pt-2">
            <textarea
              className="w-full text-xs border border-gray-200 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Order notes (customizations, allergies...)"
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Cart is empty.</p>
              <p className="text-xs">Click items to add to order.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-orange-600 font-medium">${item.base_price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({customerData?.customer_type?.toUpperCase()} {discountRate}%)</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0 || !selectedCustomer || saving}
            onClick={handlePlaceOrder}
          >
            {saving ? 'Processing...' : orderId ? 'Update Order' : 'Place Order'}
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add New Customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await api.users.create({
                  ...newCustomer,
                  full_name: newCustomer.name,
                  role: 'customer',
                  status: 'active',
                  password: 'password123' // Default password for new customers
                });
                showNotification("Customer added successfully!");
                setIsCustomerModalOpen(false);
                // Refresh users
                const usrs = await api.users.getAll();
                setUsers(usrs);
              } catch (error: any) {
                showNotification(error.message || "Failed to add customer", "error");
              }
            }}>Add Customer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
          />
          <Input
            label="Phone Number"
            placeholder="555-0123"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="john@example.com"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={newCustomer.type}
                onChange={(e) => {
                  const type = e.target.value as 'regular' | 'vip' | 'member';
                  let discount = 0;
                  if (type === 'vip') discount = 15;
                  else if (type === 'member') discount = 5;
                  setNewCustomer({...newCustomer, type, discount});
                }}
              >
                <option value="regular">Regular</option>
                <option value="member">Member (5%)</option>
                <option value="vip">VIP (15%)</option>
              </select>
            </div>
            <Input
              label="Custom Discount (%)"
              type="number"
              value={newCustomer.discount}
              onChange={(e) => setNewCustomer({...newCustomer, discount: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewOrder;
