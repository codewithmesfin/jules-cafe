"use client";

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Users, Calendar, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, UserPlus, Package, MessageSquare,
  TrendingUp, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { api } from '../../utils/api';
import { cn } from '../../utils/cn';
import type { Order, Reservation, User, MenuItem } from '../../types';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          ordersData,
          reservationsData,
          usersData,
          productsData
        ] = await Promise.all([
          api.stats.getDashboard(),
          api.orders.getAll(),
          api.reservations.getAll(),
          api.users.getAll(),
          api.stats.getProducts('limit=5')
        ]);

        // Handle API response wrapper if present
        const stats = (statsData as any)?.data || statsData;
        const orders = (ordersData as any)?.data || ordersData;
        const reservations = (reservationsData as any)?.data || reservationsData;
        const users = (usersData as any)?.data || usersData;
        const products = (productsData as any)?.data || productsData;

        // Validate stats structure
        const validStats = (stats && typeof stats.totalOrders === 'number') ? stats : null;

        setStats(validStats);
        setRecentOrders((orders as Order[]).slice(0, 5));
        setRecentReservations((reservations as Reservation[]).slice(0, 5));
        setRecentUsers((users as User[]).slice(0, 5));
        setTopItems((products as any[]).slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = stats?.revenuePerDay?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
  const totalOrders = stats?.totalOrders || recentOrders.length;
  const totalCustomers = stats?.totalCustomers || recentUsers.filter((u: User) => u.role === 'customer').length;
  const avgRating = stats?.avgRating || 4.5;

  // Calculate trends based on real data
  const todayOrders = recentOrders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(o.created_at).toISOString().split('T')[0] === today;
  }).length;

  const completedOrders = recentOrders.filter(o => o.status === 'completed').length;

  // Revenue trend data for chart
  const revenueTrendData = stats?.revenuePerDay?.map((day: any) => ({
    date: day._id.split('-').slice(1).join('/'),
    revenue: day.total,
    orders: day.count || 0
  })) || [];

  // Generate activity feed from real data
  const getCustomerName = (customerId: string | any) => {
    if (typeof customerId === 'string') return 'Walk-in Guest';
    return customerId?.full_name || customerId?.username || 'Guest';
  };

  const activityFeed = [
    ...recentOrders.slice(0, 3).map(order => ({
      user: getCustomerName(order.customer_id),
      action: 'placed order',
      target: `#${order.order_number?.split('-').pop()}`,
      time: new Date(order.created_at).toLocaleString(),
      icon: ShoppingBag,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    })),
    ...recentReservations.slice(0, 2).map(res => ({
      user: getCustomerName(res.customer_id),
      action: 'made reservation for',
      target: `${res.guests_count} guests on ${new Date(res.reservation_date).toLocaleDateString()}`,
      time: new Date(res.created_at).toLocaleString(),
      icon: Calendar,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    })),
    ...recentUsers.slice(0, 2).filter((u: User) => u.role === 'customer').map(user => ({
      user: user.full_name || user.username,
      action: 'registered as customer',
      target: '',
      time: new Date(user.created_at).toLocaleString(),
      icon: UserPlus,
      iconColor: 'text-[#e60023]',
      bgColor: 'bg-orange-100'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#e60023] rounded-full animate-spin"></div>
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Analytics loading...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+15.2%', trendType: 'up', color: 'text-[#e60023]', bg: 'bg-orange-50' },
          { label: 'Total Orders', value: todayOrders.toString(), icon: ShoppingBag, trend: '+12.5%', trendType: 'up', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Customers', value: totalCustomers.toString(), icon: Users, trend: '+5.2%', trendType: 'up', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Rating', value: avgRating.toFixed(1), icon: Activity, trend: '+2.4%', trendType: 'up', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white p-6 rounded-3xl hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div className={cn(
                'flex items-center text-sm font-bold px-2 py-1 rounded-full',
                stat.trendType === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              )}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart - Google Analytics Style */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm rounded-3xl p-8 bg-white" title="Revenue & Orders Trend">
            <div className="h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="adminOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(value) => `ETB ${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ea580c"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#adminRevenue)"
                    name="Revenue (ETB)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#adminOrders)"
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top Items Chart */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm rounded-3xl p-8 bg-white h-full" title="Top Selling Items">
            <div className="space-y-6 mt-4">
              {topItems.map((item, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center font-black text-[#e60023] text-sm">
                        #{i + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.total_sold} sold</p>
                      </div>
                    </div>
                    <span className="font-black text-[#e60023] text-sm">ETB {item.total_revenue?.toFixed(0)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e60023] rounded-full shadow-[0_0_8px_rgba(234,88,12,0.3)] transition-all duration-1000"
                      style={{ width: `${(item.total_sold / (topItems[0]?.total_sold || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {topItems.length === 0 && (
                <div className="text-center py-10">
                  <Package size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">No sales data yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white" title="Recent Orders">
            <Table
              data={recentOrders}
              columns={[
                { header: 'Order ID', accessor: (item) => `#${item.order_number?.split('-').pop()}` },
                { header: 'Date', accessor: (item) => new Date(item.created_at).toLocaleDateString() },
                { header: 'Amount', accessor: (item) => `ETB ${item.total_amount?.toFixed(2)}` },
                {
                  header: 'Status',
                  accessor: (item) => (
                    <Badge
                      variant={
                        item.status === 'completed' ? 'success' :
                        item.status === 'cancelled' ? 'error' : 'warning'
                      }
                      className="capitalize font-bold rounded-lg"
                    >
                      {item.status}
                    </Badge>
                  )
                },
              ]}
            />
          </Card>
        </div>

        {/* Real Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm rounded-3xl p-8 bg-white h-full" title="Live Activity Feed">
            <div className="space-y-5 mt-2">
              {activityFeed.length > 0 ? (
                activityFeed.map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={cn("p-2.5 rounded-xl flex-shrink-0", activity.bgColor, activity.iconColor)}>
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-black">{activity.user}</span>{' '}
                        <span className="font-normal text-gray-500">{activity.action}</span>{' '}
                        <span className="font-bold text-[#e60023] truncate">{activity.target}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-gray-300" />
                        <p className="text-[10px] text-gray-400 font-bold">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Activity size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">No recent activity</p>
                </div>
              )}
            </div>

            {/* Performance Summary */}
            <div className="mt-8 p-5 bg-gradient-to-br from-[#e60023] to-[#e60023] rounded-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Today's Progress</p>
                  <TrendingUp size={20} className="opacity-50" />
                </div>
                <p className="text-3xl font-black mb-1">{completedOrders}</p>
                <p className="text-orange-100 text-sm font-medium">Orders Completed</p>
                <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (completedOrders / Math.max(todayOrders, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
