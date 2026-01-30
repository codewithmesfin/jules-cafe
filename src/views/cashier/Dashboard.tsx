"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, Clock, CheckCircle, UserPlus, List } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
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
      setOrders(data.filter((o: Order) => o.branch_id === user?.branch_id));
    } catch (error) {
      console.error('Failed to fetch cashier orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completedToday = orders.filter(o => o.status === 'completed').length;

  if (loading) return <div className="text-center py-20">Loading Cashier Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Cashier Terminal</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/cashier/new-order')} className="gap-2">
            <UserPlus size={18} /> Walk-in Order
          </Button>
          <Button variant="outline" onClick={() => router.push('/cashier/queue')} className="gap-2">
            <List size={18} /> View Queue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold">{activeOrders.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Today</p>
            <h3 className="text-2xl font-bold">{completedToday}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold">{orders.length}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Order Type Distribution">
          <div className="space-y-4 py-4">
            {[
              { type: 'Walk-in', count: orders.filter(o => o.type === 'walk-in').length, color: 'bg-blue-500' },
              { type: 'Self-service', count: orders.filter(o => o.type === 'self-service').length, color: 'bg-orange-500' },
            ].map((stat) => (
              <div key={stat.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stat.type}</span>
                  <span className="text-gray-500">{stat.count} orders</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`${stat.color} h-full rounded-full`}
                    style={{ width: `${(stat.count / (orders.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Revenue Distribution">
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total_amount, 0) / orders.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500">Avg Ticket Size</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">
                {orders.length > 0 ? ((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100).toFixed(0) : '0'}%
              </p>
              <p className="text-xs text-gray-500">Cancellation Rate</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">
                ${orders.reduce((acc, o) => acc + o.total_amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Successful Sales</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
