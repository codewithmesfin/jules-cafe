import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { calculateAvailablePortions } from '../../utils/recipeUtils';
import { useNotification } from '../../context/NotificationContext';
import type { Recipe, MenuItem, Branch, InventoryItem } from '../../types';

const Recipes: React.FC = () => {
  const { showNotification } = useNotification();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [formIngredients, setFormIngredients] = useState<{item_name: string, quantity: number, unit: string}[]>([]);
  const [formInstructions, setFormInstructions] = useState('');
  const [formMenuItemId, setFormMenuItemId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recData, itemData, brData, invData] = await Promise.all([
        api.recipes.getAll(),
        api.menuItems.getAll(),
        api.branches.getAll(),
        api.inventory.getAll(),
      ]);
      setRecipes(recData);
      setMenuItems(itemData);
      setBranches(brData);
      setInventory(invData);
      if (brData.length > 0) setSelectedBranchId(brData[0].id);
    } catch (error) {
      console.error('Failed to fetch recipes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const menuItemId = typeof recipe.menu_item_id === 'string' ? recipe.menu_item_id : (recipe.menu_item_id as any).id;
    const menuItem = menuItems.find(m => m.id === menuItemId);
    return menuItem?.branch_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const branchInventory = inventory.filter(i => i.branch_id === selectedBranchId);

  const handleSave = async () => {
    try {
      const recipeData = {
        menu_item_id: formMenuItemId,
        ingredients: formIngredients,
        instructions: formInstructions
      };

      if (editingRecipe) {
        await api.recipes.update(editingRecipe.id, recipeData);
        showNotification("Recipe updated successfully");
      } else {
        await api.recipes.create(recipeData);
        showNotification("Recipe created successfully");
      }
      setIsModalOpen(false);
      setEditingRecipe(null);
      fetchData();
    } catch (error) {
      showNotification("Failed to save recipe", "error");
    }
  };

  const handleDelete = async () => {
    if (recipeToDelete) {
      try {
        await api.recipes.delete(recipeToDelete.id);
        showNotification("Recipe deleted successfully", "success");
        setIsDeleteDialogOpen(false);
        setRecipeToDelete(null);
        fetchData();
      } catch (error) {
        showNotification("Failed to delete recipe", "error");
      }
    }
  };

  if (loading) return <div className="text-center py-20">Loading Recipes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search recipes by menu item..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>Inventory: {b.branch_name}</option>
            ))}
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingRecipe(null);
          setFormIngredients([{ item_name: '', quantity: 0, unit: '' }]);
          setFormInstructions('');
          setFormMenuItemId(menuItems[0]?.id || '');
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Create Recipe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-50 border-orange-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-bold uppercase">Total Recipes</p>
              <h3 className="text-2xl font-bold text-orange-900">{recipes.length}</h3>
            </div>
          </div>
        </Card>

        {filteredRecipes.slice(0, 6).map(recipe => {
          const menuItemId = typeof recipe.menu_item_id === 'string' ? recipe.menu_item_id : (recipe.menu_item_id as any).id;
          const menuItem = menuItems.find(m => m.id === menuItemId);
          const available = calculateAvailablePortions(recipe, branchInventory);

          return (
            <Card key={recipe.id} className="relative overflow-hidden">
              {available < 5 && (
                <div className="absolute top-0 right-0 p-2">
                  <Badge variant="error" className="flex items-center gap-1">
                    <AlertCircle size={12} /> Low Stock
                  </Badge>
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={menuItem?.image_url}
                  alt={menuItem?.branch_name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{menuItem?.branch_name}</h4>
                  <p className="text-xs text-gray-500">{recipe.ingredients.length} ingredients</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <span className="text-sm text-gray-600 font-medium">Available to serve</span>
                <span className={`text-lg font-bold ${available < 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {available}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  setEditingRecipe(recipe);
                  setFormIngredients([...recipe.ingredients]);
                  setFormInstructions(recipe.instructions || '');
                  setFormMenuItemId(menuItemId);
                  setIsModalOpen(true);
                }}>
                  Edit Recipe
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Table
        data={filteredRecipes}
        columns={[
          {
            header: 'Menu Item',
            accessor: (r) => {
              const menuItemId = typeof r.menu_item_id === 'string' ? r.menu_item_id : (r.menu_item_id as any).id;
              return menuItems.find(m => m.id === menuItemId)?.branch_name || 'Unknown';
            }
          },
          {
            header: 'Ingredients',
            accessor: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.ingredients.map((ing, idx) => (
                  <Badge key={idx} variant="neutral" className="text-[10px]">
                    {ing.item_name}: {ing.quantity}{ing.unit}
                  </Badge>
                ))}
              </div>
            )
          },
          {
            header: 'Available (Portions)',
            accessor: (r) => {
              const available = calculateAvailablePortions(r, branchInventory);
              return (
                <span className={available < 5 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                  {available}
                </span>
              );
            }
          },
          {
            header: 'Actions',
            accessor: (r) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  const menuItemId = typeof r.menu_item_id === 'string' ? r.menu_item_id : (r.menu_item_id as any).id;
                  setEditingRecipe(r);
                  setFormIngredients([...r.ingredients]);
                  setFormInstructions(r.instructions || '');
                  setFormMenuItemId(menuItemId);
                  setIsModalOpen(true);
                }}>
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    setRecipeToDelete(r);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
        size="lg"
      >
        <div className="space-y-4">
          {!editingRecipe && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Menu Item</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formMenuItemId}
                onChange={(e) => setFormMenuItemId(e.target.value)}
              >
                {menuItems.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Ingredients</label>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 h-8"
                onClick={() => setFormIngredients([...formIngredients, { item_name: '', quantity: 0, unit: '' }])}
              >
                <Plus size={14} className="mr-1" /> Add Ingredient
              </Button>
            </div>
            <div className="space-y-2">
              {formIngredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Ingredient Name"
                      value={ing.item_name}
                      onChange={(e) => {
                        const newIngs = [...formIngredients];
                        newIngs[idx].item_name = e.target.value;
                        setFormIngredients(newIngs);
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => {
                        const newIngs = [...formIngredients];
                        newIngs[idx].quantity = parseFloat(e.target.value) || 0;
                        setFormIngredients(newIngs);
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => {
                        const newIngs = [...formIngredients];
                        newIngs[idx].unit = e.target.value;
                        setFormIngredients(newIngs);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 mb-1"
                    onClick={() => setFormIngredients(formIngredients.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Instructions</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="Step by step instructions..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Recipe</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Recipes;
