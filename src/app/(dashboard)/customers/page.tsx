"use client";

import React, { useState } from 'react';
import { Plus, Search, Edit, Phone, Mail, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';

export default function CustomersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', totalSpent: 450.50, visits: 12 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', totalSpent: 320.00, visits: 8 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', totalSpent: 890.75, visits: 25 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+1234567893', totalSpent: 156.00, visits: 5 },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500">Manage your customer database</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Total Spent</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Visits</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail size={14} /> {customer.email}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Phone size={14} /> {customer.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <DollarSign size={16} />
                      {customer.totalSpent.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{customer.visits}</td>
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
