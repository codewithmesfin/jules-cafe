"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Edit2, ShoppingBag, CheckCircle, Play, XCircle, ChevronRight, X } from 'lucide-react';
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
import type { Order, User, Product } from '../../types';

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
      console.log('Setting up socket connection for business...', user.default_business_id);
      joinBusinessRoom(user.default_business_id);

      const socket = getSocket();

      socket.on('connect', () => {
        joinBusinessRoom(user.default_business_id!);
      });

      socket.on('new-order', (newOrder: any) => {
        showNotification(`New order received!`, 'info');
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
      handleCloseModal();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleOrderClick = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.order_status);
    return order.order_status === filter;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium">Track and process your business orders in real-time</p>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['active', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 text-sm font-black rounded-xl transition-all whitespace-nowrap shrink-0",
                filter === f
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <span className="capitalize">{f}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] h-64 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
            <ShoppingBag size={48} />
          </div>
          <p className="text-slate-400 font-bold text-lg">No {filter} orders found</p>
          <p className="text-slate-300 text-sm">Incoming orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map(order => {
            const customer = (order.customer_id as any);
            const itemsCount = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

            return (
              <Card 
                key={order.id || order._id}
                className="p-0 overflow-hidden flex flex-col border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer hover:border-blue-100 bg-white"
                onClick={() => handleOrderClick(order)}
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                        Order #{(order.id || order._id)?.slice(-6).toUpperCase()}
                      </span>
                      <h3 className="font-black text-slate-900 truncate">
                        {customer?.full_name || 'Guest Customer'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-300" />
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={12} className="text-slate-300" />
                      <span>{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</span>
                    </div>
                  </div>
                </div>

                {/* Body - Items Summary */}
                <div className="flex-1 p-6 bg-slate-50/30">
                  <div className="space-y-3 mb-6">
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600 truncate flex-1">
                          <span className="text-blue-600 mr-2">{item.quantity}x</span>
                          {item.product_id?.name || 'Unknown Product'}
                        </span>
                        <span className="text-slate-400 ml-2 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">
                        + {(order.items?.length || 0) - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <Badge
                      variant={
                        order.order_status === 'preparing' ? 'warning' :
                        order.order_status === 'ready' ? 'info' :
                        order.order_status === 'completed' ? 'success' : 'neutral'
                      }
                      className="capitalize px-3 py-1.5 rounded-xl font-black text-[10px]"
                    >
                      {order.order_status}
                    </Badge>
                    <div className="font-black text-xl text-slate-900">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 bg-white flex items-center gap-2 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
                  {filter === 'active' && (
                    <>
                      {order.order_status === 'pending' && (
                        <Button
                          size="sm"
                          className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-black gap-2"
                          onClick={() => handleUpdateStatus((order.id || order._id)!, 'preparing')}
                        >
                          <Play size={14} fill="currentColor" /> Accept
                        </Button>
                      )}
                      {order.order_status === 'preparing' && (
                        <Button
                          size="sm"
                          className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-black gap-2"
                          onClick={() => handleUpdateStatus((order.id || order._id)!, 'ready')}
                        >
                          <CheckCircle size={14} /> Ready
                        </Button>
                      )}
                      {order.order_status === 'ready' && (
                        <Button
                          size="sm"
                          className="flex-1 h-12 rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 font-black gap-2"
                          onClick={() => handleUpdateStatus((order.id || order._id)!, 'completed')}
                        >
                          <CheckCircle size={14} /> Complete
                        </Button>
                      )}

                      {['pending', 'accepted', 'preparing'].includes(order.order_status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-12 w-12 p-0 rounded-2xl border-slate-200 hover:bg-slate-50 hover:border-blue-200 shrink-0"
                          onClick={() => router.push(`/cashier/new-order?id=${order.id || order._id}`)}
                        >
                          <Edit2 size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </Button>
                      )}
                    </>
                  )}
                  {filter !== 'active' && (
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-2xl font-black text-slate-400 hover:text-blue-600 transition-colors gap-2"
                      onClick={() => handleOrderClick(order)}
                    >
                      View Receipt <ChevronRight size={18} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Order Details`}
        className="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {((selectedOrder.customer_id as any)?.full_name?.charAt(0) || 'G')}
                </div>
                <div>
                  <p className="font-black text-lg">{(selectedOrder.customer_id as any)?.full_name || 'Guest Customer'}</p>
                  <p className="text-sm text-slate-400">#{(selectedOrder.id || selectedOrder._id)?.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                <Badge className="bg-blue-600 border-none rounded-xl font-black text-[10px] capitalize">
                  {selectedOrder.order_status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="font-bold text-slate-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Table</p>
                <p className="font-bold text-slate-900">{(selectedOrder.table_id as any)?.table_number ? `Table ${(selectedOrder.table_id as any).table_number}` : 'Walk-in'}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] px-2">Cart Summary</h4>
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <span className="bg-slate-50 text-blue-600 font-black px-2.5 py-1 rounded-lg text-sm">{item.quantity}x</span>
                      <div>
                        <p className="font-bold text-slate-900">{item.product_id?.name || 'Unknown Product'}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-400 italic mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-slate-900 shrink-0 ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-slate-500 font-bold text-sm">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-3xl font-black text-blue-600">${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Kitchen Notes</p>
                <p className="text-sm text-slate-700 font-medium">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {filter === 'active' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {selectedOrder.order_status === 'pending' && (
                  <Button
                    className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black gap-2 shadow-lg shadow-blue-100"
                    onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'preparing')}
                  >
                    <Play size={18} fill="currentColor" /> Accept Order
                  </Button>
                )}
                {selectedOrder.order_status === 'preparing' && (
                  <Button
                    className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black gap-2 shadow-lg shadow-indigo-100"
                    onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'ready')}
                  >
                    <CheckCircle size={18} /> Mark as Ready
                  </Button>
                )}
                {selectedOrder.order_status === 'ready' && (
                  <Button
                    className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black gap-2 shadow-lg shadow-green-100 col-span-2"
                    onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'completed')}
                  >
                    <CheckCircle size={18} /> Complete Order
                  </Button>
                )}
                {['pending', 'preparing'].includes(selectedOrder.order_status) && (
                  <Button
                    variant="outline"
                    className="h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-black"
                    onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'cancelled')}
                  >
                    <XCircle size={18} /> Cancel Transaction
                  </Button>
                )}
              </div>
            )}

            <Button variant="outline" onClick={handleCloseModal} className="w-full h-14 rounded-2xl font-black text-slate-400 hover:bg-slate-50 border-slate-100">
              Back to Queue
            </Button>
          </div>
        )}
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

export default OrderQueue;
