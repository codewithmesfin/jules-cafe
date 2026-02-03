"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { RoleGuard } from '../../../../components/RoleGuard';
import { ArrowUp, ArrowDown, Filter } from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const transactions = [
    { id: 1, ingredient: 'Tomatoes', type: 'purchase', quantity: 50, unit: 'kg', date: '2024-01-15', user: 'John Doe' },
    { id: 2, ingredient: 'Chicken Breast', type: 'sale', quantity: 5, unit: 'kg', date: '2024-01-15', user: 'Jane Smith' },
    { id: 3, ingredient: 'Olive Oil', type: 'adjustment', quantity: -2, unit: 'bottles', date: '2024-01-14', user: 'John Doe' },
    { id: 4, ingredient: 'Mozzarella', type: 'purchase', quantity: 30, unit: 'kg', date: '2024-01-13', user: 'Jane Smith' },
    { id: 5, ingredient: 'Tomatoes', type: 'waste', quantity: 3, unit: 'kg', date: '2024-01-12', user: 'Bob Johnson' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Transactions</h1>
            <p className="text-slate-500">Log of all stock changes</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
              <option value="waste">Waste</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Ingredient</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Quantity</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.ingredient}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'purchase' ? 'bg-green-100 text-green-700' :
                      tx.type === 'sale' ? 'bg-blue-100 text-blue-700' :
                      tx.type === 'waste' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.type === 'purchase' && <ArrowUp size={12} />}
                      {tx.type === 'sale' && <ArrowDown size={12} />}
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${tx.quantity > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                      {tx.quantity > 0 ? '+' : ''}{tx.quantity} {tx.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{tx.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
}
