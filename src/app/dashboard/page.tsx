"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, BarChart3, ShoppingCart, PlusCircle, Database, ArrowRight, DollarSign } from 'lucide-react';
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

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier', 'waiter']}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.full_name || 'Admin'}! Here's your overview.</p>
          </div>
          <Link href="/orders?mode=new">
            <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
              New Order
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-slate-900" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">${stats.total_revenue.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-emerald-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {stats.active_orders} active
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.active_orders}</p>
            <p className="text-sm text-slate-500 mt-1">Active Orders</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.menu_items}</p>
            <p className="text-sm text-slate-500 mt-1">Menu Items</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.customers_today}</p>
            <p className="text-sm text-slate-500 mt-1">Orders Today</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card
              title="Recent Orders"
              subtitle="Latest order activities"
              headerAction={
                <Link href="/orders" className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
            >
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">No orders yet</p>
                  <Link href="/orders?mode=new">
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
                <Link href="/products" className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
            >
              {popularItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">No products yet</p>
                  <Link href="/products/new">
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
                      href={`/products/${item.id}`}
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/products" className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                <Package size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">Product Catalog</h3>
                <p className="text-sm text-slate-500">Manage your menu items</p>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Link>

          <Link href="/ingredients/inventory" className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Inventory</h3>
                <p className="text-sm text-slate-500">Stock levels & tracking</p>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Link>

          <Link href="/reports" className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Reports</h3>
                <p className="text-sm text-slate-500">Analytics & insights</p>
              </div>
              <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
