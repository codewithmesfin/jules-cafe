"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Edit2, ShoppingBag, CheckCircle, Play, XCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import { getSocket, joinBusinessRoom } from '../../utils/socket';
import type { Order } from '../../types';

interface ExtendedOrder extends Order {
  items?: any[];
}

const OrderQueue: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.default_business_id]);

  useEffect(() => {
    if (user?.default_business_id) {
      const businessId = typeof user.default_business_id === 'string' ? user.default_business_id : user.default_business_id._id || '';
      if (businessId) {
        joinBusinessRoom(businessId);
        const socket = getSocket();
        socket.on('connect', () => joinBusinessRoom(businessId));
        socket.on('new-order', (newOrder: any) => {
          showNotification('New order received!', 'info');
          setOrders(prev => [newOrder as ExtendedOrder, ...prev]);
        });
        socket.on('order-status-update', (data: any) => {
          setOrders(prev => prev.map(order =>
            (order.id === data.orderId || order._id === data.orderId)
              ? { ...order, order_status: data.status as any }
              : order
          ));
        });
        return () => {
          socket.off('connect');
          socket.off('new-order');
          socket.off('order-status-update');
        };
      }
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordData = await api.orders.getAll();
      setOrders(Array.isArray(ordData) ? ordData : ordData.data || []);
    } catch (error) {
      console.error('Failed to fetch order queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.orders.update(id, { order_status: status });
      showNotification(`Order marked as ${status}`);
      fetchData();
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleOrderClick = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.order_status);
    return order.order_status === filter;
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'preparing':
      case 'ready':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'pending':
      case 'accepted':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-500';
      case 'preparing':
      case 'ready':
        return 'bg-amber-500';
      case 'cancelled':
        return 'bg-rose-500';
      case 'pending':
      case 'accepted':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500">Manage and track your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(['active', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No {filter} orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const customer = order.customer_id as any;
            const table = order.table_id as any;
            const itemsCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

            return (
              <div
                key={order.id || order._id}
                onClick={() => handleOrderClick(order)}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        #{((order.id || order._id)?.slice(-6) || '').toUpperCase()}
                      </span>
                      <Badge variant={getStatusVariant(order.order_status)} size="sm">
                        {order.order_status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {customer?.full_name || 'Guest'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {table && (
                    <div className="flex items-center gap-1">
                      <span>Table {table.table_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ShoppingBag size={14} />
                    <span>{itemsCount} items</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2 mb-4">
                  {order.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        <span className="text-slate-900 font-medium">{item.quantity}x</span> {item.product_id?.name || 'Item'}
                      </span>
                      <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <p className="text-xs text-slate-400">+{(order.items?.length || 0) - 3} more</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  {filter === 'active' && (
                    <>
                      {order.order_status === 'pending' && (
                        <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id || order._id!, 'preparing'); }}>
                          <Play size={14} /> Accept
                        </Button>
                      )}
                      {order.order_status === 'preparing' && (
                        <Button size="sm" variant="secondary" className="flex-1" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id || order._id!, 'ready'); }}>
                          <CheckCircle size={14} /> Ready
                        </Button>
                      )}
                      {order.order_status === 'ready' && (
                        <Button size="sm" variant="primary" className="flex-1" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id || order._id!, 'completed'); }}>
                          <CheckCircle size={14} /> Complete
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/orders?mode=new&id=${order.id || order._id}`); }}>
                        <Edit2 size={16} />
                      </Button>
                    </>
                  )}
                  {filter !== 'active' && (
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => handleOrderClick(order)}>
                      View Details <ChevronRight size={16} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wide">Order</p>
                <p className="text-xl font-bold text-slate-900">#{((selectedOrder.id || selectedOrder._id)?.slice(-6) || '').toUpperCase()}</p>
              </div>
              <Badge variant={getStatusVariant(selectedOrder.order_status)}>
                {selectedOrder.order_status}
              </Badge>
            </div>

            {/* Customer & Table */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-medium text-slate-900">{(selectedOrder.customer_id as any)?.full_name || 'Guest'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Table</p>
                <p className="font-medium text-slate-900">{(selectedOrder.table_id as any)?.table_number ? `Table ${(selectedOrder.table_id as any).table_number}` : 'N/A'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Items</p>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-medium text-slate-700">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-slate-900">{item.product_id?.name || 'Item'}</span>
                    </div>
                    <span className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            {filter === 'active' && (
              <div className="flex gap-3 pt-4">
                {selectedOrder.order_status === 'pending' && (
                  <Button className="flex-1" onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id!, 'preparing')}>
                    <Play size={16} /> Accept Order
                  </Button>
                )}
                {selectedOrder.order_status === 'preparing' && (
                  <Button variant="secondary" className="flex-1" onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id!, 'ready')}>
                    <CheckCircle size={16} /> Mark Ready
                  </Button>
                )}
                {selectedOrder.order_status === 'ready' && (
                  <Button className="flex-1" onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id!, 'completed')}>
                    <CheckCircle size={16} /> Complete
                  </Button>
                )}
                {['pending', 'preparing'].includes(selectedOrder.order_status) && (
                  <Button variant="danger" onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id!, 'cancelled')}>
                    <XCircle size={16} /> Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderQueue;
