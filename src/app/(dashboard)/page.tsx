"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Sales', value: '$12,345', change: '+12.5%', positive: true, icon: DollarSign },
    { label: 'New Orders', value: '45', change: '+8.2%', positive: true, icon: ShoppingBag },
    { label: 'Customers', value: '128', change: '+5.1%', positive: true, icon: Users },
    { label: 'Low Stock Items', value: '3', change: '-2', positive: true, icon: Package },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', items: 3, total: 45.99, status: 'completed', time: '5 min ago' },
    { id: 'ORD-002', customer: 'Jane Smith', items: 2, total: 28.50, status: 'preparing', time: '12 min ago' },
    { id: 'ORD-003', customer: 'Bob Johnson', items: 5, total: 89.99, status: 'pending', time: '18 min ago' },
    { id: 'ORD-004', customer: 'Alice Brown', items: 1, total: 12.00, status: 'ready', time: '25 min ago' },
  ];

  const lowStockItems = [
    { name: 'Tomatoes', current: 5, reorder: 20, unit: 'kg' },
    { name: 'Chicken Breast', current: 2, reorder: 15, unit: 'kg' },
    { name: 'Olive Oil', current: 3, reorder: 10, unit: 'bottles' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier', 'waiter']}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user?.full_name || 'User'}!</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <stat.icon size={24} className="text-blue-600" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRight size={16} />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
                <a href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</a>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{order.id}</p>
                      <p className="text-sm text-slate-500">{order.customer} • {order.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                    <p className={`text-xs font-medium capitalize ${
                      order.status === 'completed' ? 'text-green-600' :
                      order.status === 'preparing' ? 'text-blue-600' :
                      order.status === 'ready' ? 'text-purple-600' :
                      'text-amber-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
                <a href="/ingredients/inventory" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Manage Inventory</a>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {lowStockItems.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <AlertCircle size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Reorder level: {item.reorder} {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">{item.current} {item.unit}</p>
                    <p className="text-xs text-slate-500">Current stock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/orders" className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <ShoppingBag size={24} className="text-slate-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">New Order</span>
            </a>
            <a href="/products" className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <Package size={24} className="text-slate-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Add Product</span>
            </a>
            <a href="/customers" className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <Users size={24} className="text-slate-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Add Customer</span>
            </a>
            <a href="/reports" className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <TrendingUp size={24} className="text-slate-600 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">View Reports</span>
            </a>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
