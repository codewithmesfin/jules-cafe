"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Edit2, ShoppingBag, CheckCircle, Play, XCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Order, User } from '../../types';

const OrderQueue: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [filter, setFilter] = useState('active'); // active, completed, cancelled
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-6 bg-orange-100 text-orange-600 rounded-3xl shadow-inner">
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
                  ? "bg-white text-orange-600 shadow-sm"
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
              <Card key={order.id} className="p-0 overflow-hidden flex flex-col border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-gray-200/50 transition-all group border hover:border-orange-100">
                {/* Header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
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
                          <span className="text-orange-600 mr-1.5">{item.quantity}x</span>
                          {item.menu_item_name}
                        </span>
                        <span className="text-gray-400 ml-2 shrink-0">${(item.unit_price * item.quantity).toFixed(2)}</span>
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
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 bg-white flex items-center gap-2 border-t border-gray-50">
                  {filter === 'active' && (
                    <>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="flex-1 h-10 rounded-xl bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100 font-black gap-2"
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
                          <Edit2 size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
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
                      className="w-full h-10 rounded-xl font-black text-gray-400 group-hover:text-orange-600 transition-colors gap-2"
                      onClick={() => router.push(`/cashier/new-order?id=${order.id}`)}
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
