"use client";

import React from 'react';
import { TrendingUp, Package, Users, BarChart3, ShoppingCart, PlusCircle, Database, ArrowRight, DollarSign } from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Revenue', value: '$12,458', change: '+12.5%', icon: DollarSign, color: 'text-slate-900', bg: 'bg-slate-100' },
    { label: 'Active Orders', value: '24', change: '5 pending', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Menu Items', value: '156', change: '12 categories', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Customers Today', value: '89', change: '+8 new', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', table: 'Table 5', amount: '$45.50', status: 'completed', time: '5 min ago' },
    { id: 'ORD-002', customer: 'Jane Smith', table: 'Table 12', amount: '$78.00', status: 'preparing', time: '12 min ago' },
    { id: 'ORD-003', customer: 'Mike Johnson', table: 'Table 3', amount: '$32.25', status: 'pending', time: '18 min ago' },
    { id: 'ORD-004', customer: 'Sarah Williams', table: 'Table 8', amount: '$95.75', status: 'completed', time: '25 min ago' },
    { id: 'ORD-005', customer: 'Tom Brown', table: 'Table 1', amount: '$56.00', status: 'preparing', time: '30 min ago' },
  ];

  const popularItems = [
    { name: 'Grilled Salmon', orders: 45, revenue: '$1,125' },
    { name: 'Caesar Salad', orders: 38, revenue: '$570' },
    { name: 'Beef Steak', orders: 32, revenue: '$1,280' },
    { name: 'Pasta Carbonara', orders: 28, revenue: '$560' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      completed: 'success',
      preparing: 'warning',
      pending: 'neutral',
      cancelled: 'error',
    };
    return styles[status] || 'neutral';
  };

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
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{order.id}</td>
                        <td className="px-6 py-4">{order.customer}</td>
                        <td className="px-6 py-4">{order.table}</td>
                        <td className="px-6 py-4 font-semibold">{order.amount}</td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadge(order.status)} size="sm">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{order.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Popular Items */}
          <div>
            <Card
              title="Popular Items"
              subtitle="Best sellers today"
              headerAction={
                <Link href="/products" className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.orders} orders</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">{item.revenue}</p>
                  </div>
                ))}
              </div>
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
