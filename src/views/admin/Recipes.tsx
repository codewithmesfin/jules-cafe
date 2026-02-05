"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UtensilsCrossed, Save, X, ChevronRight, Package } from 'lucide-react';
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
        api.ingredients.getAll()
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="w-1/3 bg-white rounded-2xl border border-slate-200 h-[600px]" />
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 h-[600px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Product List - Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <Card padding="none">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-3">Products</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredProducts.map(p => {
              const hasRecipe = recipes.some(r => r.product_id === p.id);
              const isActive = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => loadRecipeForProduct(p)}
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-slate-50",
                    isActive ? "bg-slate-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("font-medium truncate", isActive ? "text-slate-900" : "text-slate-900")}>
                        {p.name}
                      </p>
                      <Badge variant={hasRecipe ? 'success' : 'neutral'} size="sm">
                        {hasRecipe ? 'Configured' : 'No recipe'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight size={16} className={cn("text-slate-300", isActive && "text-slate-400")} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recipe Editor */}
      <div className="flex-1">
        {selectedProduct ? (
          <Card padding="none">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed size={24} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-slate-500">Configure ingredients</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </Button>
                {canUpdate('recipes') && (
                  <Button size="sm" onClick={saveRecipe}>
                    <Save size={16} className="mr-1" /> Save
                  </Button>
                )}
              </div>
            </div>

            {/* Ingredients List */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-500">Ingredients</h4>
                {canUpdate('recipes') && (
                  <Button variant="ghost" size="sm" onClick={addIngredientRow}>
                    <Plus size={16} className="mr-1" /> Add
                  </Button>
                )}
              </div>

              {editingIngredients.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">No ingredients added</p>
                  {canUpdate('recipes') && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={addIngredientRow}>
                      Add Ingredient
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {editingIngredients.map((ing, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <select
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        value={ing.ingredient_id}
                        onChange={(e) => updateIngredientRow(idx, 'ingredient_id', e.target.value)}
                        disabled={!canUpdate('recipes')}
                      >
                        <option value="">Select ingredient</option>
                        {ingredients.map(i => (
                          <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          value={ing.quantity_required || ''}
                          onChange={(e) => updateIngredientRow(idx, 'quantity_required', parseFloat(e.target.value) || 0)}
                          disabled={!canUpdate('recipes')}
                        />
                        {canUpdate('recipes') && (
                          <button
                            onClick={() => removeIngredientRow(idx)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a product</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Choose a product from the list to configure its recipe ingredients
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recipes;
