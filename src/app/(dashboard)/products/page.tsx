"use client";

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';

export default function ProductsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 12.99, status: 'active', stock: 50 },
    { id: 2, name: 'Caesar Salad', category: 'Salads', price: 8.99, status: 'active', stock: 30 },
    { id: 3, name: 'Grilled Chicken', category: 'Main Course', price: 15.99, status: 'active', stock: 25 },
    { id: 4, name: 'Pasta Carbonara', category: 'Pasta', price: 11.99, status: 'inactive', stock: 0 },
  ];

  const categories = ['Pizza', 'Salads', 'Main Course', 'Pasta', 'Desserts', 'Beverages'];

  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500">Manage your product catalog</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Plus size={20} />
              Add Product
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10"
          />
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg"><Eye size={16} className="text-blue-500" /></button>
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
