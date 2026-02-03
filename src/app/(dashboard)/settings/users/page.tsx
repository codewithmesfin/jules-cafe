"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Plus, Edit, Trash2, Shield, Mail, Phone } from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuth();

  const staff = [
    { id: 1, name: 'John Doe', email: 'john@restaurant.com', role: 'admin', phone: '+1234567890', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@restaurant.com', role: 'manager', phone: '+1234567891', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@restaurant.com', role: 'cashier', phone: '+1234567892', status: 'active' },
    { id: 4, name: 'Alice Brown', email: 'alice@restaurant.com', role: 'waiter', phone: '+1234567893', status: 'active' },
  ];

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    cashier: 'bg-green-100 text-green-700',
    waiter: 'bg-amber-100 text-amber-700',
  };

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
            <p className="text-slate-500">Manage staff access and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus size={20} />
            Add Staff
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail size={14} /> {member.email}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <Phone size={14} /> {member.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role as keyof typeof roleColors]}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit size={16} className="text-slate-500" />
                      </button>
                      {member.role !== 'admin' && (
                        <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-rose-500" />
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
