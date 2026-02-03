"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, BookOpen, MoreVertical, Package, ChevronRight } from "lucide-react";
import { api } from "../../utils/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmationDialog } from "../../components/ui/ConfirmationDialog";
import { useNotification } from "../../context/NotificationContext";
import { cn } from "../../utils/cn";
import type { Recipe, Product, Ingredient } from "../../types";

const Recipes = () => {
  const { showNotification } = useNotification();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const [formData, setFormData] = useState({
    product_id: "",
    ingredient_id: "",
    quantity_required: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, prodRes, ingRes] = await Promise.all([
        api.recipes.getAll(),
        api.products.getAll(),
        api.ingredients.getAll()
      ]);
      setRecipes(Array.isArray(recRes) ? recRes : recRes.data || []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.data || []);
      setIngredients(Array.isArray(ingRes) ? ingRes : ingRes.data || []);
    } catch (error) {
      showNotification("Failed to load recipe engine", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((rec) => {
    const product = products.find(p => (p.id === rec.product_id || (p as any)._id === rec.product_id));
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSave = async () => {
    if (!formData.product_id || !formData.ingredient_id || !formData.quantity_required) {
      showNotification("All fields are mandatory", "error");
      return;
    }

    try {
      if (editingRecipe) {
        await api.recipes.update((editingRecipe.id || (editingRecipe as any)._id)!, formData);
        showNotification("Recipe link optimized");
      } else {
        await api.recipes.create(formData);
        showNotification("Recipe link established");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || "Engine failure", "error");
    }
  };

  const handleDelete = async () => {
    if (recipeToDelete) {
      try {
        await api.recipes.delete((recipeToDelete.id || (recipeToDelete as any)._id)!);
        showNotification("Recipe link severed", "warning");
        fetchData();
      } catch (error) {
        showNotification("Deletion failed", "error");
      } finally {
        setRecipeToDelete(null);
      }
    }
  };

  const openModal = (rec: Recipe | null = null) => {
    if (rec) {
      setEditingRecipe(rec);
      setFormData({
        product_id: rec.product_id,
        ingredient_id: typeof rec.ingredient_id === 'string' ? rec.ingredient_id : (rec.ingredient_id as any).id || (rec.ingredient_id as any)._id,
        quantity_required: rec.quantity_required
      });
    } else {
      setEditingRecipe(null);
      setFormData({ product_id: "", ingredient_id: "", quantity_required: 0 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recipe Engine</h1>
          <p className="text-slate-500 font-medium">Link products to ingredients for automated inventory deduction</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-black flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Build Recipe
        </Button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm border">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Search by product name..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-24">
             <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No recipes configured</p>
          </div>
        ) : (
          <Table
            data={filteredRecipes}
            columns={[
              {
                header: "Production Map",
                accessor: (r) => {
                  const product = products.find(p => (p.id === r.product_id || (p as any)._id === r.product_id));
                  const ingredientId = typeof r.ingredient_id === 'string' ? r.ingredient_id : (r.ingredient_id as any).id || (r.ingredient_id as any)._id;
                  const ingredient = ingredients.find(i => (i.id === ingredientId || i._id === ingredientId));
                  return (
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                          <Package size={14} className="text-blue-600" />
                          <span className="font-black text-slate-900 text-sm">{product?.name || "Deleted Product"}</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-300" />
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100">
                          <BookOpen size={14} className="text-blue-600" />
                          <span className="font-black text-blue-700 text-sm">{ingredient?.name || "Deleted Asset"}</span>
                       </div>
                    </div>
                  );
                }
              },
              {
                header: "Net Consumption",
                accessor: (r) => {
                   const ingredientId = typeof r.ingredient_id === 'string' ? r.ingredient_id : (r.ingredient_id as any).id || (r.ingredient_id as any)._id;
                   const ingredient = ingredients.find(i => (i.id === ingredientId || i._id === ingredientId));
                   return (
                      <div className="flex items-center gap-1.5">
                         <span className="font-black text-slate-900 text-lg">{r.quantity_required}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ingredient?.unit || "units"} / sale</span>
                      </div>
                   );
                }
              },
              {
                header: "Action Control",
                accessor: (r) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(r)}
                      className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setRecipeToDelete(r)}
                      className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecipe ? "Refine Recipe Link" : "Establish Recipe Link"}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100 font-black">
              {editingRecipe ? "Sync Link" : "Forge Link"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
           <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Target Product</label>
              <select
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                disabled={!!editingRecipe}
              >
                <option value="">Choose Catalog Item...</option>
                {products.map(p => (
                  <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>{p.name}</option>
                ))}
              </select>
           </div>

           <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Linked Ingredient</label>
              <select
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                value={formData.ingredient_id}
                onChange={(e) => setFormData({ ...formData, ingredient_id: e.target.value })}
              >
                <option value="">Choose Inventory Asset...</option>
                {ingredients.map(i => (
                  <option key={i.id || (i as any)._id} value={i.id || (i as any)._id}>{i.name} ({i.unit})</option>
                ))}
              </select>
           </div>

           <Input
              label="Quantity per Unit Sold *"
              type="number"
              step="0.001"
              placeholder="e.g. 0.05"
              className="rounded-xl h-12"
              value={formData.quantity_required || ""}
              onChange={(e) => setFormData({ ...formData, quantity_required: parseFloat(e.target.value) || 0 })}
           />
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={handleDelete}
        title="Sever Recipe Link"
        description="Are you sure you want to stop tracking this ingredient for this product?"
        confirmLabel="Sever Link"
        variant="danger"
      />
    </div>
  );
};

export default Recipes;
