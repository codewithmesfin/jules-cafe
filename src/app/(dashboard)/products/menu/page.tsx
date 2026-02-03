"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit, Eye } from 'lucide-react';

export default function MenuPage() {
  const { user } = useAuth();

  const menuItems = [
    { id: 1, name: 'Margherita Pizza', price: 12.99, available: true, availableFrom: '10:00', availableTo: '22:00' },
    { id: 2, name: 'Caesar Salad', price: 8.99, available: true, availableFrom: '10:00', availableTo: '21:00' },
    { id: 3, name: 'Grilled Chicken', price: 15.99, available: false, availableFrom: '11:00', availableTo: '22:00' },
    { id: 4, name: 'Pasta Carbonara', price: 11.99, available: true, availableFrom: '10:00', availableTo: '22:00' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Menu</h1>
            <p className="text-slate-500">Manage menu availability and timing</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Availability</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Time</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.availableFrom} - {item.availableTo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit size={16} className="text-slate-500" />
                      </button>
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
