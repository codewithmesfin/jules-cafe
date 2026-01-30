import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, UtensilsCrossed } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_CATEGORIES, MOCK_RECIPES, MOCK_INVENTORY, MOCK_BRANCHES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { calculateAvailablePortions } from '../../utils/recipeUtils';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import type { MenuItem } from '../../types';

const MenuItems: React.FC = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<MenuItem | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState(MOCK_BRANCHES[0].id);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formBasePrice, setFormBasePrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {MOCK_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingItem(null);
          setFormName('');
          setFormCategoryId(MOCK_CATEGORIES[0]?.id || '');
          setFormBasePrice(0);
          setFormImageUrl('');
          setFormDescription('');
          setFormIsActive(true);
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add Item
        </Button>
      </div>

      <Table
        data={filteredItems}
        columns={[
          {
            header: 'Item',
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-bold text-gray-900">{item.name}</span>
              </div>
            )
          },
          {
            header: 'Category',
            accessor: (item) => MOCK_CATEGORIES.find(c => c.id === item.category_id)?.name || 'N/A'
          },
          { header: 'Base Price', accessor: (item) => `$${item.base_price.toFixed(2)}` },
          {
            header: 'Status',
            accessor: (item) => (
              <Badge variant={item.is_active ? 'success' : 'neutral'}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600"
                  onClick={() => setViewingRecipe(item)}
                  title="View Recipe"
                >
                  <UtensilsCrossed size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setFormName(item.name);
                    setFormCategoryId(item.category_id);
                    setFormBasePrice(item.base_price);
                    setFormImageUrl(item.image_url);
                    setFormDescription(item.description);
                    setFormIsActive(item.is_active);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setItemToDelete(item)}
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}>Cancel</Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              if (editingItem) {
                setItems(prev => prev.map(i => i.id === editingItem.id ? {
                  ...i,
                  name: formName,
                  category_id: formCategoryId,
                  base_price: formBasePrice,
                  image_url: formImageUrl,
                  description: formDescription,
                  is_active: formIsActive
                } : i));
                showNotification("Item updated successfully");
              } else {
                const newItem: MenuItem = {
                  id: `m${Date.now()}`,
                  name: formName,
                  category_id: formCategoryId,
                  base_price: formBasePrice,
                  image_url: formImageUrl,
                  description: formDescription,
                  is_active: formIsActive,
                  created_at: new Date().toISOString()
                };
                setItems(prev => [...prev, newItem]);
                showNotification("Item created successfully");
              }
              setEditingItem(null);
            }}>
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Item Name"
            placeholder="e.g. Pasta Carbonara"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
            >
              {MOCK_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formBasePrice}
            onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Image URL"
            placeholder="https://..."
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_item"
              className="rounded text-orange-600 focus:ring-orange-500"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
            <label htmlFor="is_active_item" className="text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        title={`Recipe: ${viewingRecipe?.name}`}
        size="lg"
      >
        {viewingRecipe && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Stock Availability</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-900">
                    {(() => {
                      const recipe = MOCK_RECIPES.find(r => r.menu_item_id === viewingRecipe.id);
                      if (!recipe) return 0;
                      const branchInv = MOCK_INVENTORY.filter(i => i.branch_id === selectedBranchId);
                      return calculateAvailablePortions(recipe, branchInv);
                    })()}
                  </span>
                  <span className="text-blue-700 font-medium text-sm">portions available</span>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Check Branch</label>
                <select
                  className="w-full sm:w-48 rounded-md border-blue-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  {MOCK_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UtensilsCrossed size={16} className="text-orange-500" />
                Ingredients (per serving)
              </h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Ingredient</th>
                      <th className="px-4 py-2 font-semibold text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {MOCK_RECIPES.find(r => r.menu_item_id === viewingRecipe.id)?.ingredients.map((ing, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{ing.item_name}</td>
                        <td className="px-4 py-2 text-right">{ing.quantity} {ing.unit}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-center text-gray-500 italic">No recipe defined yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {MOCK_RECIPES.find(r => r.menu_item_id === viewingRecipe.id) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg border border-orange-100">
                  {MOCK_RECIPES.find(r => r.menu_item_id === viewingRecipe.id)?.instructions}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setViewingRecipe(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            showNotification("Item deleted successfully", "warning");
          }
          setItemToDelete(null);
        }}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default MenuItems;
