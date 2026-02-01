"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, Clock, CheckCircle, UserPlus, List, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '../../utils/cn';
import type { Order } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user?.branch_id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      setOrders(data.filter((o: Order) => {
        const branchId = typeof o.branch_id === 'string' ? o.branch_id : (o.branch_id as any)?.id;
        const userBId = typeof user?.branch_id === "string" ? user?.branch_id : (user?.branch_id as any)?.id;
        return branchId === userBId;
      }));
    } catch (error) {
      console.error('Failed to fetch cashier orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completedToday = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
    return o.status === 'completed' && orderDate === today;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status === 'completed' ? o.total_amount : 0), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Terminal...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Terminal Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome back, <span className="text-orange-600 font-bold">{user?.full_name || user?.username}</span></p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => router.push('/cashier/new-order')} className="flex-1 md:flex-none gap-2 h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-100 font-black">
            <UserPlus size={18} /> New Order
          </Button>
          <Button variant="outline" onClick={() => router.push('/cashier/queue')} className="flex-1 md:flex-none gap-2 h-12 rounded-2xl border-gray-200 hover:border-orange-200 hover:bg-orange-50 font-black">
            <List size={18} /> View Queue
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed Today', value: completedToday.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg Ticket Size', value: `ETB ${orders.length > 0 ? (totalRevenue / (orders.filter(o => o.status === 'completed').length || 1)).toFixed(2) : '0.00'}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white p-6 rounded-[2rem] flex items-center gap-5 hover:shadow-xl transition-shadow group">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem] p-0 overflow-hidden bg-white">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
            <button onClick={() => router.push('/cashier/queue')} className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-gray-50 overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-20 text-center text-gray-400 font-medium">No orders found yet</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {orders.slice(0, 5).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900 text-sm">#{order.order_number.split('-').pop()}</span>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700 text-sm truncate max-w-[120px] block">
                          {(order.customer_id as any)?.full_name || (order.customer_id as any)?.username || 'Walk-in Guest'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.status === 'completed' ? 'success' :
                          order.status === 'cancelled' ? 'error' :
                          ['preparing', 'ready'].includes(order.status) ? 'warning' : 'neutral'
                        } className="font-black rounded-lg">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">${order.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/cashier/new-order?id=${order.id}`)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Analytics Highlights */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-white">
            <h3 className="text-xl font-black text-gray-900 mb-6">Order Channels</h3>
            <div className="space-y-6">
              {[
                { type: 'Walk-in Orders', count: orders.filter(o => o.type === 'walk-in').length, color: 'bg-orange-600', icon: UserPlus },
                { type: 'Self-service', count: orders.filter(o => o.type === 'self-service').length, color: 'bg-blue-600', icon: Clock },
              ].map((stat) => (
                <div key={stat.type} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <stat.icon size={14} className="text-gray-400" />
                      <span className="font-black text-xs text-gray-900 uppercase tracking-widest">{stat.type}</span>
                    </div>
                    <span className="text-xs font-black text-gray-500">{stat.count}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`${stat.color} h-full rounded-full transition-all duration-1000`}
                      style={{ width: `${(stat.count / (orders.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="border-none shadow-sm rounded-[2rem] p-6 bg-gradient-to-br from-orange-600 to-orange-500 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Shift Performance</h3>
              <p className="text-orange-100 text-sm font-medium mb-6">You're doing great today!</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">ETB {totalRevenue.toLocaleString()}</span>
                <span className="text-orange-100 text-[10px] font-black uppercase tracking-widest mb-1.5">Total Revenue</span>
              </div>
            </div>
            <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
