"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Plus, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();

  const inventory = [
    { id: 1, ingredient: 'Tomatoes', current: 25, reorderLevel: 20, unit: 'kg', lastRestocked: '2024-01-15' },
    { id: 2, ingredient: 'Chicken Breast', current: 15, reorderLevel: 15, unit: 'kg', lastRestocked: '2024-01-14' },
    { id: 3, ingredient: 'Olive Oil', current: 5, reorderLevel: 10, unit: 'bottles', lastRestocked: '2024-01-10' },
    { id: 4, ingredient: 'Mozzarella', current: 30, reorderLevel: 25, unit: 'kg', lastRestocked: '2024-01-15' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="text-slate-500">Track stock levels and manage reorders</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Plus size={20} />
              Add Stock
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Total Items</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {inventory.filter(i => i.current <= i.reorderLevel).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Total Value</p>
            <p className="text-3xl font-bold text-green-600 mt-1">$1,245</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Ingredient</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Current Stock</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Reorder Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Last Restocked</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.ingredient}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{item.current} {item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.reorderLevel} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.current <= item.reorderLevel ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <AlertTriangle size={12} />
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.lastRestocked}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <ArrowUp size={16} className="text-green-600" />
                      </button>
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                          <ArrowDown size={16} className="text-rose-600" />
                        </button>
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
