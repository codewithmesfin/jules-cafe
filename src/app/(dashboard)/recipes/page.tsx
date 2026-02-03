"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { Plus, Edit, Trash2, ChefHat } from 'lucide-react';

export default function RecipesPage() {
  const { user } = useAuth();

  const recipes = [
    { id: 1, product: 'Margherita Pizza', ingredients: 'Tomatoes, Mozzarella, Basil', cost: 4.50 },
    { id: 2, product: 'Caesar Salad', ingredients: 'Lettuce, Chicken, Croutons, Cheese', cost: 3.20 },
    { id: 3, product: 'Grilled Chicken', ingredients: 'Chicken Breast, Herbs, Olive Oil', cost: 7.50 },
    { id: 4, product: 'Pasta Carbonara', ingredients: 'Pasta, Eggs, Bacon, Cheese', cost: 4.80 },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Recipes</h1>
            <p className="text-slate-500">Manage product recipes and ingredients</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus size={20} />
            Add Recipe
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <ChefHat size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{recipe.product}</h3>
                  <p className="text-sm text-slate-500 mt-1">{recipe.ingredients}</p>
                  <p className="text-lg font-bold text-slate-900 mt-2">Cost: ${recipe.cost.toFixed(2)}</p>
                </div>
              </div>
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
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
