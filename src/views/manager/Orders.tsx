"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import type { Order, User } from '../../types';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user?.branch_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordData, userData] = await Promise.all([
        api.orders.getAll(),
        api.users.getAll(),
      ]);
    setOrders(ordData.filter((o: Order) => {
      const branchId = typeof o.branch_id === 'string' ? o.branch_id : (o.branch_id as any)?.id;
      return branchId === user?.branch_id;
    }));
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch manager orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const details = await api.orders.getOne(order.id);
      setSelectedOrder(details);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.orders.update(id, { status });
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search branch orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                const customerId = typeof order.customer_id === 'string' ? order.customer_id : (order.customer_id as any)?.id;
                return users.find(u => u.id === customerId)?.full_name || 'Walk-in';
              }
            },
            { header: 'Amount', accessor: (order) => `$${order.total_amount.toFixed(2)}` },
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
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                  <Eye size={16} className="mr-2" /> Details
                </Button>
              )
            }
          ]}
        />
      )}

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.order_number}`}
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
              >
                <XCircle size={18} className="mr-2" /> Cancel Order
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <Button className="gap-2" onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}>
                    <CheckCircle size={18} /> Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <p className="font-medium capitalize">{selectedOrder.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold">Type</p>
                <p className="font-medium capitalize">{selectedOrder.type}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menu_item_name} x {item.quantity}</span>
                    <span className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr />

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${(selectedOrder.total_amount + (selectedOrder.discount_amount || 0)).toFixed(2)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${selectedOrder.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
