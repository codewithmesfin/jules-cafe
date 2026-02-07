"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ShoppingBag, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface OrderItem {
  product_id?: { name: string };
  name?: string;
  quantity: number;
  price: number;
}

interface Order {
  id?: string;
  _id?: string;
  order_number?: string;
  number?: string;
  customer_id?: { full_name: string };
  customer?: { name: string };
  total_amount?: number;
  total?: number;
  order_status?: string;
  status?: string;
  created_at?: string;
  items?: OrderItem[];
  discount_percent?: number;
  discount_amount?: number;
  subtotal_amount?: number;
}

const OrdersArchive: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { 
    if (user?.default_business_id) {
      fetchOrders();
    }
  }, [user?.default_business_id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch real orders from API
      const response = await api.orders.getAll();
      const ordersData = Array.isArray(response) ? response : response.data || [];
      
      // Transform data to match component structure
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id || order._id,
        order_number: order.order_number || order.number,
        number: order.order_number,
        customer_id: order.customer_id,
        customer: order.customer_id?.full_name || { name: order.customer?.name || 'Guest' },
        total_amount: order.total_amount || order.total,
        total: order.total_amount || order.total,
        order_status: order.order_status || order.status,
        status: order.order_status || order.status,
        created_at: order.created_at,
        items: order.items || [],
        discount_percent: order.discount_percent,
        discount_amount: order.discount_amount,
        subtotal_amount: order.subtotal_amount
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.update(orderId, { order_status: status });
      showNotification(`Order status updated to ${status}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    }
  };

  const getOrderId = (order: Order) => order.id || order._id || '';

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
          <p className="text-xs text-slate-500">Preparing</p>
          <p className="text-xl font-bold text-amber-600">{orders.filter(o => o.status === 'preparing').length}</p>
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
            <Card key={getOrderId(order)} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900">#{order.order_number}</p>
                  <p className="text-sm text-slate-500">{order.customer?.name || order.customer_id?.full_name || 'Guest'}</p>
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
                  <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <span className="font-semibold text-slate-900">Br {order.total?.toFixed(2) || order.total_amount?.toFixed(2) || '0.00'}</span>
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
                onClick={() => handleUpdateStatus(getOrderId(selectedOrder), 'cancelled')}
              >
                <XCircle size={16} className="mr-1" /> Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleUpdateStatus(getOrderId(selectedOrder), 'completed')}
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
                <p className="font-semibold text-slate-900">#{selectedOrder.order_number}</p>
                <p className="text-sm text-slate-500">{selectedOrder.customer?.name || selectedOrder.customer_id?.full_name || 'Guest'}</p>
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
                      <span className="text-slate-700">{item.product_id?.name || item.name || 'Item'}</span>
                    </div>
                    <span className="font-medium text-slate-900">Br {(item.price * item.quantity)?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Information */}
            {(selectedOrder.discount_percent || 0) > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex justify-between text-sm text-green-700">
                  <span>Subtotal</span>
                  <span>Br {selectedOrder.subtotal_amount?.toFixed(2) || selectedOrder.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({selectedOrder.discount_percent}%)</span>
                  <span>- Br {selectedOrder.discount_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl text-white">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">Br {selectedOrder.total?.toFixed(2) || selectedOrder.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersArchive;
