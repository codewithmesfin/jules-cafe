import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Calendar, ArrowUpRight, ArrowDownRight, DollarSign, Activity, UserPlus, Package, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { api } from '../../utils/api';
import { cn } from '../../utils/cn';
import type { Order } from '../../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          api.stats.getDashboard(),
          api.orders.getAll(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats ? `ETB ${stats.revenuePerDay?.reduce((acc: any, curr: any) => acc + curr.total, 0).toLocaleString()}` : 'ETB 0', icon: DollarSign, trend: '+15.2%', trendType: 'up' },
    { label: 'Total Orders', value: stats?.totalOrders || '0', icon: ShoppingBag, trend: '+12.5%', trendType: 'up' },
    { label: 'Total Customers', value: stats?.totalCustomers || '0', icon: Users, trend: '+5.2%', trendType: 'up' },
    { label: 'Avg Rating', value: stats?.avgRating?.toFixed(1) || '0.0', icon: Activity, trend: '+2.4%', trendType: 'up' },
  ];

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                stat.trendType === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.trend}
                {stat.trendType === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Preview */}
        <div className="lg:col-span-2">
          <Card title="Revenue Overview (Last 7 Days)">
            <div className="h-64 flex items-end justify-between gap-2 px-2 pb-2">
              {stats?.revenuePerDay?.map((day: any, i: number) => {
                const max = Math.max(...stats.revenuePerDay.map((d: any) => d.total)) || 1;
                const height = (day.total / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-orange-100 rounded-t-sm relative group">
                      <div
                        className="w-full bg-orange-500 rounded-t-sm transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ETB {day.total.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{day._id.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Top Branches */}
        <div className="lg:col-span-1">
          <Card title="Top Branches by Sales">
            <div className="space-y-4">
              {stats?.topBranches?.map((branch: any) => (
                <div key={branch.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{branch.name}</p>
                    <p className="text-xs text-gray-500">ETB {branch?.sales?.toLocaleString()}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">{branch.count} orders</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card title="Recent Orders">
            <Table
              data={recentOrders}
              columns={[
                { header: 'Order ID', accessor: 'order_number' },
                { header: 'Date', accessor: (item) => new Date(item.created_at).toLocaleDateString() },
                { header: 'Amount', accessor: (item) => `ETB ${item.total_amount.toFixed(2)}` },
                {
                  header: 'Status',
                  accessor: (item) => (
                    <Badge
                      variant={
                        item.status === 'completed' ? 'success' :
                        item.status === 'cancelled' ? 'error' : 'warning'
                      }
                      className="capitalize"
                    >
                      {item.status}
                    </Badge>
                  )
                },
              ]}
            />
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card title="Recent Activity">
            <div className="space-y-4">
              {[
                { user: 'Admin User', action: 'updated menu item', target: 'Grilled Salmon', time: '5m ago', icon: Package, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
                { user: 'Admin User', action: 'added new user', target: 'John Cashier', time: '25m ago', icon: UserPlus, iconColor: 'text-green-600', bgColor: 'bg-green-100' },
                { user: 'Manager User', action: 'replied to review', target: '#rv1', time: '1h ago', icon: MessageSquare, iconColor: 'text-orange-600', bgColor: 'bg-orange-100' },
                { user: 'Admin User', action: 'deleted category', target: 'Old Sides', time: '2h ago', icon: Activity, iconColor: 'text-red-600', bgColor: 'bg-red-100' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className={cn("p-2 rounded-full h-fit", activity.bgColor, activity.iconColor)}>
                    <activity.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user} <span className="font-normal text-gray-500">{activity.action}</span> {activity.target}
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
