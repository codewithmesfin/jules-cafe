"use client";
import React, { useState, useEffect } from 'react';
import { Clock, MoreVertical, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
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
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <Clock size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to view the order queue.
        </p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Live Order Queue</h1>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {(['active', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="capitalize">{f}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No orders found in this category.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="p-0 overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-900">{order.order_number}</span>
                    <Badge variant={order.type === 'walk-in' ? 'info' : 'neutral'}>
                      {order.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const customerId = typeof order.customer_id === 'string' ? order.customer_id : (order.customer_id as any)?.id;
                      const customer = users.find(u => u.id === customerId);
                      return customer?.full_name || customer?.username || 'Walk-in Guest';
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">${order.total_amount.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                    <Clock size={10} />
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <Badge
                    variant={
                      ['preparing', 'ready'].includes(order.status) ? 'warning' :
                      order.status === 'completed' ? 'success' : 'neutral'
                    }
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit Order"
                      onClick={() => router.push(`/cashier/new-order?id=${order.id}`)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm"><MoreVertical size={14} /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleUpdateStatus(order.id, 'preparing')}>Accept</Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(order.id, 'ready')}>Ready</Button>
                    )}
                    {order.status === 'ready' && (
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(order.id, 'completed')}>Complete</Button>
                    )}
                    {['pending', 'preparing'].includes(order.status) && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderQueue;
