"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ShoppingBag, Clock, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

// Mock formatCurrency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
};

const OrdersArchive: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockOrders = [
        { id: '1', number: 'ORD-2024-001', customer: { name: 'John Doe' }, total: 45, status: 'completed', created_at: new Date().toISOString(), items: [{ name: 'Burger', quantity: 2, price: 15 }, { name: 'Coke', quantity: 1, price: 5 }] },
        { id: '2', number: 'ORD-2024-002', customer: { name: 'Jane Smith' }, total: 32, status: 'pending', created_at: new Date().toISOString(), items: [{ name: 'Pizza', quantity: 1, price: 25 }, { name: 'Salad', quantity: 1, price: 7 }] },
        { id: '3', number: 'ORD-2024-003', customer: { name: 'Mike Johnson' }, total: 67, status: 'completed', created_at: new Date().toISOString(), items: [{ name: 'Steak', quantity: 2, price: 30 }, { name: 'Wine', quantity: 1, price: 7 }] },
        { id: '4', number: 'ORD-2024-004', customer: { name: 'Sarah Wilson' }, total: 28, status: 'cancelled', created_at: new Date().toISOString(), items: [{ name: 'Pasta', quantity: 1, price: 18 }, { name: 'Soup', quantity: 1, price: 5 }] },
        { id: '5', number: 'ORD-2024-005', customer: { name: 'Tom Brown' }, total: 55, status: 'completed', created_at: new Date().toISOString(), items: [{ name: 'Fish', quantity: 1, price: 35 }, { name: 'Rice', quantity: 1, price: 5 }] },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      showNotification(`Order status updated to ${status}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Order Archives</h1>
          <p className="text-slate-500 text-sm">Review history and manage transaction records</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by order number or customer..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-xl font-bold text-emerald-600">{orders.filter(o => o.status === 'completed').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-xl font-bold text-amber-600">{orders.filter(o => o.status === 'pending').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Cancelled</p>
          <p className="text-xl font-bold text-rose-600">{orders.filter(o => o.status === 'cancelled').length}</p>
        </Card>
      </div>

      {/* Orders Grid - Mobile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900">#{order.number}</p>
                  <p className="text-sm text-slate-500">{order.customer?.name || 'Guest'}</p>
                </div>
                <Badge 
                  variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}
                  size="sm"
                >
                  {order.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(order)}>
                  <Eye size={14} className="mr-1" /> Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Summary"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
              >
                <XCircle size={16} className="mr-1" /> Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                disabled={selectedOrder.status === 'completed'}
              >
                <CheckCircle size={16} className="mr-1" /> Complete
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900">#{selectedOrder.number}</p>
                <p className="text-sm text-slate-500">{selectedOrder.customer?.name || 'Guest'}</p>
              </div>
              <Badge 
                variant={selectedOrder.status === 'completed' ? 'success' : selectedOrder.status === 'cancelled' ? 'error' : 'warning'}
              >
                {selectedOrder.status}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                        {item.quantity}
                      </span>
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl text-white">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">{formatCurrency(selectedOrder.total)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersArchive;
