"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { BarChart3, DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('week');

  const stats = [
    { label: 'Total Revenue', value: '$12,345', change: '+12.5%', icon: DollarSign, color: 'green' },
    { label: 'Orders', value: '156', change: '+8.2%', icon: TrendingUp, color: 'blue' },
    { label: 'Average Order', value: '$79.13', change: '+5.1%', icon: BarChart3, color: 'purple' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'saas_admin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500">Analytics and business insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'blue' ? 'bg-blue-50' :
                  'bg-purple-50'
                }`}>
                  <stat.icon size={24} className={
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  } />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp size={16} />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Sales Overview</h2>
          <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center">
            <p className="text-slate-500">Chart placeholder - integrate with chart library</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Products</h2>
            <div className="space-y-4">
              {['Margherita Pizza', 'Caesar Salad', 'Grilled Chicken', 'Pasta Carbonara'].map((product, i) => (
                <div key={product} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-900">{product}</span>
                  </div>
                  <span className="text-slate-600">{100 - i * 15} orders</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Categories</h2>
            <div className="space-y-4">
              {['Pizza', 'Main Course', 'Salads', 'Pasta'].map((category, i) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-slate-900">{category}</span>
                  </div>
                  <span className="text-slate-600">{200 - i * 35} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
