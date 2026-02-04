"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UtensilsCrossed, AlertCircle, Save, X, ChevronRight, Package } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../utils/cn';
import type { Recipe, Product, Ingredient } from '../../types';

const Recipes: React.FC = () => {
  const { showNotification } = useNotification();
  const { canCreate, canUpdate } = usePermission();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Editor state
  const [editingIngredients, setEditingIngredients] = useState<{ ingredient_id: string, quantity_required: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recData, prodData, ingData] = await Promise.all([
        api.recipes.getAll(),
        api.products.getAll(),
        api.ingredients.getAll(),
      ]);
      setRecipes(recData);
      setProducts(prodData);
      setIngredients(ingData);
    } catch (error) {
      showNotification("Failed to load recipe data", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadRecipeForProduct = (product: Product) => {
    setSelectedProduct(product);
    const productRecipes = recipes.filter(r => r.product_id === product.id);
    setEditingIngredients(productRecipes.map(r => ({
      ingredient_id: typeof r.ingredient_id === 'string' ? r.ingredient_id : (r.ingredient_id as any).id,
      quantity_required: r.quantity_required
    })));
  };

  const addIngredientRow = () => {
    setEditingIngredients([...editingIngredients, { ingredient_id: '', quantity_required: 0 }]);
  };

  const removeIngredientRow = (index: number) => {
    setEditingIngredients(editingIngredients.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (index: number, field: string, value: any) => {
    const newIngs = [...editingIngredients];
    (newIngs[index] as any)[field] = value;
    setEditingIngredients(newIngs);
  };

  const saveRecipe = async () => {
    if (!selectedProduct) return;

    try {
      // Logic: Delete all existing recipe entries for this product and create new ones
      // Since we don't have a bulk update endpoint, we'll do it one by one or ideally the backend should handle this.
      // For now, we'll use the existing endpoints.

      const existingRecipes = recipes.filter(r => r.product_id === selectedProduct.id);

      // Delete old
      await Promise.all(existingRecipes.map(r => api.recipes.delete(r.id)));

      // Create new
      await Promise.all(editingIngredients
        .filter(ing => ing.ingredient_id && ing.quantity_required > 0)
        .map(ing => api.recipes.create({
          product_id: selectedProduct.id,
          ingredient_id: ing.ingredient_id,
          quantity_required: ing.quantity_required
        }))
      );

      showNotification("Recipe saved successfully");
      fetchData();
    } catch (error) {
      showNotification("Failed to save recipe", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-8 animate-in fade-in duration-500">
      {/* Product List */}
      <div className="w-1/3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Products</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              placeholder="Filter products..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {filteredProducts.map(p => {
            const hasRecipe = recipes.some(r => r.product_id === p.id);
            const isActive = selectedProduct?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => loadRecipeForProduct(p)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all mb-1",
                  isActive ? "bg-blue-50 border-blue-100" : "hover:bg-slate-50 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-300" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", isActive ? "text-blue-700" : "text-slate-900")}>{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                       {hasRecipe ? 'Recipe Configured' : 'No Recipe'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className={cn(isActive ? "text-blue-400" : "text-slate-300")} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipe Editor */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {selectedProduct ? (
          <>
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4 w-full md:w-1/2">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <UtensilsCrossed size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-slate-500 text-sm">Define ingredients and quantities required for one serving.</p>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 w-full md:w-1/2">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="rounded-xl font-bold">Cancel</Button>
                {canUpdate('recipes') && (
                  <Button onClick={saveRecipe} className="bg-[#e60023] hover:bg-[#ad081b] text-white rounded-xl px-6 font-bold flex items-center gap-2 shadow-lg shadow-red-200">
                    <Save size={18} /> Save Recipe
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ingredients List</h4>
                {canUpdate('recipes') && (
                  <button
                    onClick={addIngredientRow}
                    className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
                  >
                    <Plus size={16} /> Add Ingredient
                  </button>
                )}
              </div>

              {editingIngredients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                     <UtensilsCrossed size={32} />
                   </div>
                   <p className="text-slate-500 font-medium">No ingredients added yet.</p>
                   {canUpdate('recipes') && (
                     <button onClick={addIngredientRow} className="text-blue-600 font-bold mt-2 hover:underline">Start adding ingredients</button>
                   )}
                </div>
              ) : (
                <div className="space-y-3">
                  {editingIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex-1">
                        <select
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          value={ing.ingredient_id}
                          onChange={(e) => updateIngredientRow(idx, 'ingredient_id', e.target.value)}
                        >
                          <option value="">Select Ingredient</option>
                          {ingredients.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32 relative">
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 text-center"
                          value={ing.quantity_required || ''}
                          onChange={(e) => updateIngredientRow(idx, 'quantity_required', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-20 text-xs font-bold text-slate-400 uppercase">
                        {ingredients.find(i => i.id === ing.ingredient_id)?.unit || "unit"}
                      </div>
                      <button
                        onClick={() => removeIngredientRow(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
               <UtensilsCrossed size={48} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Select a product to view recipe</h3>
             <p className="text-slate-500 max-w-xs">Configure the ingredients required for each item in your menu for automated inventory tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
