"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function TablesPage() {
  const { user } = useAuth();

  const tables = [
    { id: 1, name: 'Table 1', seats: 4, location: 'Main Hall', status: 'available' },
    { id: 2, name: 'Table 2', seats: 2, location: 'Main Hall', status: 'occupied' },
    { id: 3, name: 'Table 3', seats: 6, location: 'Patio', status: 'available' },
    { id: 4, name: 'Table 4', seats: 4, location: 'Main Hall', status: 'reserved' },
    { id: 5, name: 'VIP 1', seats: 8, location: 'Private Room', status: 'available' },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tables</h1>
            <p className="text-slate-500">Manage restaurant tables</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Plus size={20} />
              Add Table
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    table.status === 'available' ? 'bg-green-100' :
                    table.status === 'occupied' ? 'bg-rose-100' :
                    'bg-amber-100'
                  }`}>
                    <Users size={24} className={
                      table.status === 'available' ? 'text-green-600' :
                      table.status === 'occupied' ? 'text-rose-600' :
                      'text-amber-600'
                    } />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{table.name}</h3>
                    <p className="text-sm text-slate-500">{table.location}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  table.status === 'available' ? 'bg-green-100 text-green-700' :
                  table.status === 'occupied' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {table.status}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">{table.seats} seats</p>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium text-slate-700">
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors text-sm font-medium text-rose-600">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
