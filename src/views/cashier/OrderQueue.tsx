"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Edit2, ShoppingBag, CheckCircle, Play, XCircle, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import { getSocket, joinCashierRoom } from '../../utils/socket';
import type { Order, User } from '../../types';

const OrderQueue: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.branch_id]);

  useEffect(() => {
    console.log('Setting up socket connection for cashier...');
    joinCashierRoom();
    
    const socket = getSocket();
    console.log('Socket connected:', socket.connected);
    
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      joinCashierRoom();
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('new-order', (newOrder: any) => {
      console.log('Received new-order event:', newOrder);
      const normalizedOrder: Order & { items?: any[] } = {
        id: newOrder.orderId || newOrder.id,
        order_number: newOrder.orderNumber || newOrder.order_number,
        customer_id: newOrder.customerId || newOrder.customer_id,
        branch_id: newOrder.branchId || newOrder.branch_id,
        table_id: newOrder.tableId || newOrder.table_id,
        waiter_id: newOrder.waiterId || newOrder.waiter_id,
        status: newOrder.status,
        type: newOrder.type,
        total_amount: newOrder.totalAmount || newOrder.total_amount,
        discount_amount: newOrder.discountAmount || newOrder.discount_amount,
        notes: newOrder.notes,
        created_at: newOrder.createdAt || newOrder.created_at,
        cancel_reason: newOrder.cancelReason || newOrder.cancel_reason,
        client_request_id: newOrder.clientRequestId || newOrder.client_request_id,
        items: newOrder.items?.map((item: any) => ({
          id: item.itemId || item.id,
          order_id: item.orderId || item.order_id,
          menu_item_id: item.menuItemId || item.menu_item_id,
          menu_item_name: item.menuItemName || item.menu_item_name,
          variant_id: item.variantId || item.variant_id,
          variant_name: item.variantName || item.variant_name,
          quantity: item.quantity,
          unit_price: item.unitPrice || item.unit_price,
        })),
      };
      
      const bId = normalizedOrder.branch_id;
      const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
      if (bId === userBId) {
        showNotification(`New order #${normalizedOrder.order_number?.split('-').pop()} received!`, 'info');
        setOrders(prev => [normalizedOrder as Order, ...prev]);
      }
    });
    
    socket.on('order-status-update', (data: any) => {
      console.log('Received order-status-update event:', data);
      setOrders(prev => prev.map(order => 
        order.id === data.orderId ? { ...order, status: data.status as any } : order
      ));
    });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-order');
      socket.off('order-status-update');
    };
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordData, userData] = await Promise.all([
        api.orders.getAll(),
        api.users.getAll(),
      ]);
      setOrders(ordData.filter((o: Order) => {
        const bId = typeof o.branch_id === 'string' ? o.branch_id : (o.branch_id as any)?.id;
        const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
        return bId === userBId;
      }));
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch order queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.orders.update(id, { status });
      showNotification(`Order marked as ${status}`);
      fetchData();
      handleCloseModal();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-6 bg-orange-100 text-[#e60023] rounded-3xl shadow-inner">
          <Clock size={48} strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900">No Branch Associated</h2>
          <p className="text-gray-500 max-w-sm">
            Please associate this account with a branch to view the live order queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Order Queue</h1>
          <p className="text-gray-500 font-medium">Manage and track incoming orders in real-time</p>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['active', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 text-sm font-black rounded-xl transition-all whitespace-nowrap shrink-0",
                filter === f
                  ? "bg-white text-[#e60023] shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
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
            <div key={i} className="bg-white border border-gray-100 rounded-3xl h-64 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
            <ShoppingBag size={48} />
          </div>
          <p className="text-gray-400 font-bold text-lg">No {filter} orders found</p>
          <p className="text-gray-300 text-sm">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(order => {
            const customerId = typeof order.customer_id === 'string' ? order.customer_id : (order.customer_id as any)?.id;
            const customer = users.find(u => u.id === customerId);
            const itemsCount = (order as any).items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

            return (
              <Card 
                key={order.id} 
                className="p-0 overflow-hidden flex flex-col border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-gray-200/50 transition-all group cursor-pointer hover:border-orange-100"
                onClick={() => handleOrderClick(order)}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-[#e60023] uppercase tracking-widest mb-1">
                        Order #{order.order_number.split('-').pop()}
                      </span>
                      <h3 className="font-black text-gray-900 truncate">
                        {customer?.full_name || customer?.username || 'Guest'}
                      </h3>
                    </div>
                    <Badge variant={order.type === 'walk-in' ? 'info' : 'neutral'} className="font-black shrink-0">
                      {order.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-300" />
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <div className="flex items-center gap-1">
                      <ShoppingBag size={12} className="text-gray-300" />
                      <span>{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</span>
                    </div>
                  </div>
                </div>

                {/* Body - Items Summary */}
                <div className="flex-1 p-5 bg-gray-50/30">
                  <div className="space-y-2 mb-6">
                    {(order as any).items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs font-bold">
                        <span className="text-gray-600 truncate flex-1">
                          <span className="text-[#e60023] mr-1.5">{item.quantity}x</span>
                          {item.menu_item_name}
                        </span>
                        <span className="text-gray-400 ml-2 shrink-0">ETB {(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {((order as any).items?.length || 0) > 3 && (
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">
                        + {((order as any).items?.length || 0) - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <Badge
                      variant={
                        order.status === 'preparing' ? 'warning' :
                        order.status === 'ready' ? 'info' :
                        order.status === 'completed' ? 'success' : 'neutral'
                      }
                      className="capitalize px-3 py-1 rounded-lg"
                    >
                      {order.status}
                    </Badge>
                    <div className="font-black text-lg text-gray-900">
                      ETB {order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 bg-white flex items-center gap-2 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
                  {filter === 'active' && (
                    <>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="flex-1 h-10 rounded-xl bg-[#e60023] hover:bg-[#ad081b] shadow-lg shadow-orange-100 font-black gap-2"
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        >
                          <Play size={14} fill="currentColor" /> Accept
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-black gap-2"
                          onClick={() => handleUpdateStatus(order.id, 'ready')}
                        >
                          <CheckCircle size={14} /> Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 font-black gap-2"
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                        >
                          <CheckCircle size={14} /> Complete
                        </Button>
                      )}

                      {['pending', 'accepted', 'preparing'].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-gray-50 hover:border-orange-200 shrink-0"
                          onClick={() => router.push(`/cashier/new-order?id=${order.id}`)}
                        >
                          <Edit2 size={16} className="text-gray-400 group-hover:text-[#e60023] transition-colors" />
                        </Button>
                      )}

                      {['pending', 'preparing'].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-400 shrink-0"
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        >
                          <XCircle size={16} />
                        </Button>
                      )}
                    </>
                  )}
                  {filter !== 'active' && (
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl font-black text-gray-400 group-hover:text-[#e60023] transition-colors gap-2"
                      onClick={() => handleOrderClick(order)}
                    >
                      View Details <ChevronRight size={16} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Order #${selectedOrder?.order_number?.split('-').pop()}`}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            {(() => {
              const customerId = typeof selectedOrder.customer_id === 'string' ? selectedOrder.customer_id : (selectedOrder.customer_id as any)?.id;
              const customer = users.find(u => u.id === customerId);
              return (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-orange-100 text-[#e60023] rounded-full flex items-center justify-center font-black text-lg">
                    {customer?.full_name?.charAt(0) || customer?.username?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{customer?.full_name || customer?.username || 'Guest'}</p>
                    <p className="text-sm text-gray-500">{customer?.email || 'No email'}</p>
                  </div>
                </div>
              );
            })()}

            {/* Order Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold">Status</span>
              <Badge
                variant={
                  selectedOrder.status === 'preparing' ? 'warning' :
                  selectedOrder.status === 'ready' ? 'info' :
                  selectedOrder.status === 'completed' ? 'success' : 
                  selectedOrder.status === 'cancelled' ? 'error' : 'neutral'
                }
                className="capitalize px-3 py-1 rounded-lg font-black"
              >
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Order Type */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold">Order Type</span>
              <Badge variant={selectedOrder.type === 'walk-in' ? 'info' : 'neutral'} className="capitalize font-black">
                {selectedOrder.type}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Order Items</h4>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {(selectedOrder as any).items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="text-[#e60023] font-black min-w-[24px]">{item.quantity}x</span>
                      <div>
                        <p className="font-bold text-gray-900">{item.menu_item_name}</p>
                        {item.variant_name && (
                          <p className="text-xs text-gray-500">{item.variant_name}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-400 italic mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-gray-900 shrink-0 ml-4">ETB {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-black text-gray-900">ETB {(selectedOrder.total_amount + (selectedOrder.discount_amount || 0)).toFixed(2)}</span>
              </div>
              {!!selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-ETB {selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Total</span>
                <span className="text-2xl font-black text-[#e60023]">ETB {selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Notes */}
            {selectedOrder.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Order Notes</p>
                <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order ID</span>
                <span className="font-bold text-gray-900 text-sm">{selectedOrder.order_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order Date</span>
                <span className="font-bold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order Time</span>
                <span className="font-bold text-gray-900">{new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {filter === 'active' && (
              <div className="grid grid-cols-2 gap-3">
                {selectedOrder.status === 'pending' && (
                  <Button
                    className="h-12 rounded-xl bg-[#e60023] hover:bg-[#ad081b] font-black gap-2"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                  >
                    <Play size={16} fill="currentColor" /> Accept Order
                  </Button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button
                    className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black gap-2"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')}
                  >
                    <CheckCircle size={16} /> Mark Ready
                  </Button>
                )}
                {selectedOrder.status === 'ready' && (
                  <Button
                    className="h-12 rounded-xl bg-green-600 hover:bg-green-700 font-black gap-2 col-span-2"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  >
                    <CheckCircle size={16} /> Complete Order
                  </Button>
                )}
                {['pending', 'preparing'].includes(selectedOrder.status) && (
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl border-red-200 text-red-500 hover:bg-red-50 font-black"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  >
                    <XCircle size={16} /> Cancel Order
                  </Button>
                )}
              </div>
            )}

            <Button variant="outline" onClick={handleCloseModal} className="w-full h-12 rounded-xl font-black">
              Close
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
