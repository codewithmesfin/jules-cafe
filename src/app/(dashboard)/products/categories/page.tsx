"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 1, name: 'Pizza', productCount: 12, isActive: true },
    { id: 2, name: 'Salads', productCount: 8, isActive: true },
    { id: 3, name: 'Main Course', productCount: 15, isActive: true },
    { id: 4, name: 'Pasta', productCount: 10, isActive: false },
    { id: 5, name: 'Desserts', productCount: 6, isActive: true },
    { id: 6, name: 'Beverages', productCount: 9, isActive: true },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
            <p className="text-slate-500">Organize your products into categories</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{category.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{category.productCount} products</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  category.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
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
