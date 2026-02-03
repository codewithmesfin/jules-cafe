"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function IngredientsPage() {
  const { user } = useAuth();

  const ingredients = [
    { id: 1, name: 'Tomatoes', unit: 'kg', costPerUnit: 3.50, sku: 'ING-001', isActive: true },
    { id: 2, name: 'Chicken Breast', unit: 'kg', costPerUnit: 12.00, sku: 'ING-002', isActive: true },
    { id: 3, name: 'Olive Oil', unit: 'bottles', costPerUnit: 8.50, sku: 'ING-003', isActive: true },
    { id: 4, name: 'Mozzarella', unit: 'kg', costPerUnit: 15.00, sku: 'ING-004', isActive: false },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ingredients</h1>
            <p className="text-slate-500">Manage your ingredient library</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Plus size={20} />
              Add Ingredient
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{ingredient.name}</h3>
                  <p className="text-sm text-slate-500">{ingredient.unit}</p>
                  <p className="text-lg font-bold text-slate-900 mt-2">${ingredient.costPerUnit.toFixed(2)} / {ingredient.unit}</p>
                  <p className="text-xs text-slate-400">SKU: {ingredient.sku}</p>
                </div>
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
