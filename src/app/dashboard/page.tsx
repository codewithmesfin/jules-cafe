"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, Users, BarChart3, ShoppingCart, PlusCircle, Database, ArrowRight, DollarSign, Clock, Zap, CreditCard, Box, FlaskConical } from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
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
      
      // Set popular items from real product data
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
      pending: 'info',
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier', 'waiter']}>
      <div className="space-y-6">
        
        {/* Quick Actions - Mobile First Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Link href="/dashboard/orders/new" className="group">
            <Card hover className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shrink-0">
                  <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">New Order</h3>
                  <p className="text-xs text-gray-500">Quick POS</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/orders" className="group">
            <Card hover className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Active Orders</h3>
                  <p className="text-xs text-gray-500">{stats.active_orders} pending</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/products" className="group col-span-2 sm:col-span-1">
            <Card hover className="p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Package size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Products</h3>
                  <p className="text-xs text-gray-500">{stats.menu_items} items</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Stock Entry CTAs - Admin/Manager Only */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <Link href="/dashboard/ingredients/inventory" className="group">
                <Card hover className="p-4 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Box size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Ingredients</h3>
                      <p className="text-xs text-gray-500">Stock Entry</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/dashboard/ingredients/inventory" className="group">
                <Card hover className="p-4 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      <FlaskConical size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Finished Products</h3>
                      <p className="text-xs text-gray-500">Stock Entry</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">${stats.total_revenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Revenue</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.active_orders}</p>
            <p className="text-xs text-gray-500 mt-1">Active Orders</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-sky-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.menu_items}</p>
            <p className="text-xs text-gray-500 mt-1">Menu Items</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-rose-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.customers_today}</p>
            <p className="text-xs text-gray-500 mt-1">Orders Today</p>
          </div>
        </div>

        {/* Main Content Grid - Mobile First Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders - Card Style for Mobile */}
          <div className="lg:col-span-2">
            <Card
              title="Recent Orders"
              subtitle="Latest activities"
              headerAction={
                <Link href="/dashboard/orders" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
              padding="none"
            >
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/dashboard/orders/new">
                    <Button className="mt-4" variant="outline" size="sm">
                      Create First Order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/orders?id=${order.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                          {(order.customer_name || 'G')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {order.customer_name || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-400">
                            #{order.id?.slice(-6).toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold text-gray-900 text-sm">${(order.total ?? 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{formatTime(order.created_at)}</p>
                        </div>
                        <Badge variant={getStatusBadge(order.status)} size="sm">
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Popular Items - Mobile Card */}
          <div>
            <Card
              title="Menu Items"
              subtitle="Quick access"
              headerAction={
                <Link href="/dashboard/products" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                  All <ArrowRight size={14} />
                </Link>
              }
            >
              {popularItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No products</p>
                  <Link href="/dashboard/products/new">
                    <Button className="mt-3" variant="outline" size="sm">
                      Add Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {popularItems.slice(0, 5).map((item, index) => (
                    <Link 
                      key={item.id}
                      href={`/dashboard/products/${item.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[120px] sm:max-w-[150px]">{item.name}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
