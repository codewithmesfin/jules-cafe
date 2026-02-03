"use client";

import React from 'react';
import { TrendingUp, Package, Users, BarChart3, ShoppingCart, PlusCircle, Database } from 'lucide-react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = [
    { label: 'Total Sales', value: '$0.00', change: '+0%', positive: true, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Inventory Hub', value: '0 Items', change: 'Stable', positive: true, icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Customers', value: '0', change: '+0%', positive: true, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Stock Entry', value: '0 today', change: 'Normal', positive: true, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier', 'waiter']}>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Snapshot</h1>
            <p className="text-slate-500 font-medium">Welcome back, {user?.full_name || 'Admin'}</p>
          </div>
          <Link href="/orders?mode=new" className="flex items-center gap-2 px-6 h-12 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-100">
            <PlusCircle size={20} /> New Order
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}><stat.icon size={28} className={stat.color} /></div>
                <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{stat.change}</div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/products" className="group p-6 bg-slate-50 rounded-[2rem] hover:bg-blue-600 transition-all">
                <Package size={32} className="text-slate-400 mb-4 group-hover:text-white" />
                <p className="font-black text-slate-900 group-hover:text-white">Catalog</p>
                <p className="text-xs text-slate-400 group-hover:text-blue-100">Manage products</p>
              </Link>
              <Link href="/ingredients/inventory" className="group p-6 bg-slate-50 rounded-[2rem] hover:bg-blue-600 transition-all">
                <Database size={32} className="text-slate-400 mb-4 group-hover:text-white" />
                <p className="font-black text-slate-900 group-hover:text-white">Stock</p>
                <p className="text-xs text-slate-400 group-hover:text-blue-100">Inventory hub</p>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Reports Snapshot</h3>
              <Link href="/reports" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3"><BarChart3 size={20} className="text-blue-600" /><span className="font-bold text-slate-700">Daily Revenue</span></div>
                <span className="font-black text-slate-900">$0.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3"><ShoppingCart size={20} className="text-green-600" /><span className="font-bold text-slate-700">Orders Completed</span></div>
                <span className="font-black text-slate-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
