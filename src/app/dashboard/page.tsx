"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, Users, BarChart3, ShoppingCart, PlusCircle, Database, ArrowRight, DollarSign, ArrowUpRight } from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/utils/api';
import { cn } from '@/utils/cn';

interface Order {
  id: string;
  customer_name: string;
  table_id: string;
  total: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  orders_count?: number;
}

interface Stats {
  total_revenue: number;
  active_orders: number;
  menu_items: number;
  customers_today: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_revenue: 0,
    active_orders: 0,
    menu_items: 0,
    customers_today: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularItems, setPopularItems] = useState<Product[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsData = await api.analytics.getSales('period=today');
      
      // Fetch orders - handle both array and {data: array} format
      const ordersResponse = await api.orders.getAll();
      const rawOrders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.data || []);
      
      // Map backend fields to frontend format
      const ordersData = rawOrders.map((order: any) => ({
        id: order._id || order.id,
        customer_name: order.customer_id?.name || (typeof order.customer_id === 'string' ? order.customer_id : 'Guest'),
        table_id: order.table_id,
        total: order.total_amount || order.total || 0,
        status: order.order_status || order.status || 'pending',
        created_at: order.created_at || order.createdAt,
      }));
      
      // Fetch products - handle both array and {data: array} format
      const productsResponse = await api.products.getAll();
      const productsData = Array.isArray(productsResponse) ? productsResponse : (productsResponse.data || []);
      
      // Fetch customers count - handle both array and {data: array} format
      const customersResponse = await api.customers.getAll();
      const customersData = Array.isArray(customersResponse) ? customersResponse : (customersResponse.data || []);

      // Calculate stats
      const todayOrders = ordersData.filter((order: Order) => {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });

      const activeOrders = ordersData.filter((order: Order) => 
        ['pending', 'preparing', 'ready'].includes(order.status)
      );

      // Calculate revenue from completed orders
      const completedOrders = ordersData.filter((order: Order) => order.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);

      setStats({
        total_revenue: totalRevenue,
        active_orders: activeOrders.length,
        menu_items: productsData.length,
        customers_today: todayOrders.length
      });

      // Set recent orders (latest 5)
      const sortedOrders = [...ordersData].sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentOrders(sortedOrders.slice(0, 5));
      
      // For now, just use the first few products as popular items
      setPopularItems(productsData.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      completed: 'success',
      preparing: 'warning',
      ready: 'success',
      pending: 'neutral',
      cancelled: 'error',
      delivered: 'success',
    };
    if (!status) return 'neutral';
    return styles[status] || 'neutral';
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier', 'waiter']}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-slate-500 font-medium mt-1">Here's what's happening with your restaurant today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/orders/new">
              <Button leftIcon={<PlusCircle size={18} />} className="shadow-lg shadow-red-100">
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', trend: '+12.5%' },
            { label: 'Active Orders', value: stats.active_orders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', badge: `${stats.active_orders} live` },
            { label: 'Menu Items', value: stats.menu_items, icon: Package, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Orders Today', value: stats.customers_today, icon: Users, color: 'bg-amber-50 text-amber-600', trend: '+5.2%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-premium hover:shadow-premium-hover transition-all duration-300 group cursor-default"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300', stat.color)}>
                  <stat.icon size={28} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <ArrowUpRight size={14} /> {stat.trend}
                  </span>
                )}
                {stat.badge && (
                  <Badge variant="info" size="sm" className="animate-pulse">{stat.badge}</Badge>
                )}
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

          {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'New Sales', subtitle: 'Quick POS Terminal', icon: BarChart3, path: '/dashboard/orders/new', color: 'bg-indigo-600' },
            { title: 'Product Catalog', subtitle: 'Manage Menu Items', icon: Package, path: '/dashboard/products', color: 'bg-slate-900' },
            { title: 'Inventory', subtitle: 'Stock & Tracking', icon: Database, path: '/dashboard/ingredients/inventory', color: 'bg-emerald-600' },
          ].map((action) => (
            <motion.div key={action.title} variants={itemVariants}>
              <Link
                href={action.path}
                className="group flex items-center gap-5 bg-white rounded-[2rem] border border-slate-100 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300"
              >
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300', action.color)}>
                  <action.icon size={30} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 group-hover:text-[#e60023] transition-colors">{action.title}</h3>
                  <p className="text-sm text-slate-400 font-medium">{action.subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#e60023] group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card
              title="Recent Orders"
              subtitle="Latest order activities"
              headerAction={
                <Link href="/dashboard/orders" className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
            >
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">No orders yet</p>
                  <Link href="/dashboard/orders/new">
                    <Button className="mt-4" variant="outline" size="sm">
                      Create First Order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{order.id?.slice(-6).toUpperCase() || 'N/A'}</td>
                          <td className="px-6 py-4">{order.customer_name || 'Guest'}</td>
                          <td className="px-6 py-4 font-semibold">${(order.total ?? 0).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadge(order.status)} size="sm">
                              {formatStatus(order.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{formatTime(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Popular Items */}
          <div>
            <Card
              title="Menu Items"
              subtitle="Your product catalog"
              headerAction={
                <Link href="/dashboard/products" className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
            >
              {popularItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">No products yet</p>
                  <Link href="/dashboard/products/new">
                    <Button className="mt-4" variant="outline" size="sm">
                      Add Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {popularItems.map((item, index) => (
                    <Link 
                      key={item.id}
                      href={`/dashboard/products/${item.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}
