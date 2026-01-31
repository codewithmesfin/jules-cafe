import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Plus } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import type { Order, User, MenuItem } from '../../types';

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Order Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({});
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordData, userData, menuData] = await Promise.all([
        api.orders.getAll(),
        api.users.getAll(),
        api.menuItems.getAll(),
      ]);
      setOrders(ordData);
      setUsers(userData);
      setMenuItems(menuData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (order: Order) => {
    try {
      const details = await api.orders.getOne(order.id);
      setSelectedOrder(details);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setSaving(true);
      const items = Object.entries(orderItems)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const menuItem = menuItems.find(m => m.id === id);
          return {
            menu_item_id: id,
            menu_item_name: menuItem?.name || 'Unknown',
            quantity: qty,
            unit_price: menuItem?.base_price || 0
          };
        });

      if (items.length === 0) {
        alert('Please add at least one item to the order');
        return;
      }

      const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
      const customer = users.find(u => u.id === selectedCustomer);
      const discountRate = customer?.discount_rate || 0;
      const discountAmount = (subtotal * discountRate) / 100;

      const orderData = {
        customer_id: selectedCustomer,
        branch_id: users.find(u => u.id === selectedCustomer)?.branch_id || '654321098765432109876543', // Fallback
        status: 'pending',
        type: 'walk-in',
        total_amount: subtotal - discountAmount,
        discount_amount: discountAmount,
        items
      };

      await api.orders.create(orderData);
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.orders.update(id, { status });
      const updatedOrder = await api.orders.getOne(id);
      setSelectedOrder(updatedOrder);
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setOrderItems({});
    setOrderNotes('');
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order number..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Button className="gap-2" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Order
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading orders...</div>
      ) : (
        <Table
          data={filteredOrders}
          columns={[
            { header: 'Order ID', accessor: 'order_number', className: 'font-bold' },
            {
              header: 'Customer',
              accessor: (order) => {
                const customer = users.find(u => u.id === order.customer_id);
                return customer?.full_name || 'Guest';
              }
            },
            { header: 'Date', accessor: (order) => new Date(order.created_at).toLocaleString() },
            { header: 'Total', accessor: (order) => `$${order.total_amount.toFixed(2)}` },
            {
              header: 'Status',
              accessor: (order) => (
                <Badge
                  variant={
                    order.status === 'completed' ? 'success' :
                    order.status === 'cancelled' ? 'error' : 'warning'
                  }
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              )
            },
            {
              header: 'Actions',
              accessor: (order) => (
                <Button variant="ghost" size="sm" onClick={() => fetchOrderDetails(order)}>
                  <Eye size={16} className="mr-2" /> View Details
                </Button>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>Cancel</Button>
            <Button onClick={handleCreateOrder} disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {users.filter(u => u.role === 'customer').map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <label className="block text-sm font-medium text-gray-700">Order Items</label>
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg mb-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">${item.base_price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={orderItems[item.id] || 0}
                    onChange={(e) => setOrderItems({ ...orderItems, [item.id]: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <Input
            label="Notes"
            placeholder="Any special instructions..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>
      </Modal>

      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                <p className="text-sm font-medium capitalize">{selectedOrder.status}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  disabled={selectedOrder.status === 'cancelled'}
                >
                  <XCircle size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  disabled={selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                >
                  <CheckCircle size={14} />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      <div>
                        <p className="text-sm font-medium">{item.menu_item_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${(selectedOrder.total_amount + (selectedOrder.discount_amount || 0)).toFixed(2)}</span>
              </div>
              {selectedOrder.discount_amount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t mt-2">
                <span>Total</span>
                <span>${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Customer Details</h4>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Name:</span> {users.find(u => u.id === selectedOrder.customer_id)?.full_name || 'Guest'}</p>
                <p><span className="text-gray-500">Email:</span> {users.find(u => u.id === selectedOrder.customer_id)?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['pending', 'accepted', 'preparing', 'ready'].map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className="capitalize"
                  onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                  disabled={selectedOrder.status === status || selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Orders;
