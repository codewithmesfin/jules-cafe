"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Edit2, ShoppingBag, CheckCircle, Play, XCircle, ChevronRight, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
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
  const [filter, setFilter] = useState<'active' | 'completed' | 'cancelled'>('active');
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
      default:
        return 'neutral';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm">Manage and track orders</p>
        </div>

        <Link href="/dashboard/orders/new">
          <Button size="sm">
            <ShoppingBag size={16} className="mr-1" /> New Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['active', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-xl transition-all capitalize whitespace-nowrap',
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            )}
          >
            {f}
            {f === 'active' && (
              <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {orders.filter(o => !['completed', 'cancelled'].includes(o.order_status)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List - Mobile First */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No {filter} orders</p>
            {filter === 'active' && (
              <Link href="/dashboard/orders/new">
                <Button className="mt-4" variant="outline" size="sm">
                  Create New Order
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const customer = order.customer_id as any;
            const table = order.table_id as any;
            const itemsCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

            return (
              <div
                key={order.id || order._id}
                onClick={() => handleOrderClick(order)}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(order.order_status)} size="sm">
                      {order.order_status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      #{((order.id || order._id)?.slice(-6) || '').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Customer & Table */}
                <div className="mb-3">
                  <h3 className="font-semibold text-slate-900">
                    {customer?.full_name || 'Guest'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    {table && (
                      <span className="flex items-center gap-1">
                        Table {table.table_number}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(order.created_at)}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-1.5 mb-4">
                  {order.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        <span className="text-slate-900 font-medium">{item.quantity}x</span> {item.product_id?.name || 'Item'}
                      </span>
                      <span className="text-slate-400 text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <p className="text-xs text-slate-400">+{(order.items?.length || 0) - 3} more items</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  {filter === 'active' && (
                    <>
                      {order.order_status === 'preparing' && (
                        <Button size="sm" variant="secondary" className="flex-1" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id || order._id!, 'ready'); }}>
                          <CheckCircle size={14} /> Ready
                        </Button>
                      )}
                      {order.order_status === 'ready' && (
                        <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id || order._id!, 'completed'); }}>
                          <CheckCircle size={14} /> Complete
                        </Button>
                      )}
                    </>
                  )}
                  {filter !== 'active' && (
                    <Button size="sm" variant="ghost" className="w-full">
                      View Details <ChevronRight size={14} />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-medium text-slate-900">{(selectedOrder.customer_id as any)?.full_name || 'Guest'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Table</p>
                <p className="font-medium text-slate-900">{(selectedOrder.table_id as any)?.table_number ? `Table ${(selectedOrder.table_id as any).table_number}` : 'N/A'}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Items ({selectedOrder.items?.length || 0})</p>
              <div className="space-y-2">
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
                <span>${selectedOrder.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Actions */}
            {filter === 'active' && (
              <div className="flex gap-3 pt-4">
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
                {['preparing'].includes(selectedOrder.order_status) && (
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
