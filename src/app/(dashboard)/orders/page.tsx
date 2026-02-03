"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Search, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const orders = [
    { id: 'ORD-001', customer: 'John Doe', items: 3, total: 45.99, status: 'pending', time: '5 min ago', table: 'Table 1' },
    { id: 'ORD-002', customer: 'Jane Smith', items: 2, total: 28.50, status: 'preparing', time: '12 min ago', table: 'Table 3' },
    { id: 'ORD-003', customer: 'Bob Johnson', items: 5, total: 89.99, status: 'ready', time: '25 min ago', table: 'Table 5' },
    { id: 'ORD-004', customer: 'Alice Brown', items: 1, total: 12.00, status: 'completed', time: '45 min ago', table: 'Table 2' },
    { id: 'ORD-005', customer: 'Charlie Davis', items: 4, total: 56.00, status: 'cancelled', time: '1 hour ago', table: 'Table 4' },
  ];

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-500">Manage customer orders</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus size={20} />
            New Order
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Table</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Time</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{order.table}</td>
                  <td className="px-6 py-4 text-slate-600">{order.items} items</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                    <Clock size={14} />
                    {order.time}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'cashier') && (
                        <>
                          {order.status === 'pending' && (
                            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                              <ChefHat size={16} className="text-green-600" />
                            </button>
                          )}
                          {(order.status === 'preparing' || order.status === 'ready') && (
                            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                              <CheckCircle size={16} className="text-green-600" />
                            </button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                              <XCircle size={16} className="text-rose-600" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
}
