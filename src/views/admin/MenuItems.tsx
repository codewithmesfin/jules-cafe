import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UtensilsCrossed } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { calculateAvailablePortions } from '../../utils/recipeUtils';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import type { MenuItem, MenuCategory, Recipe, InventoryItem, Branch, Item } from '../../types';

const MenuItems: React.FC = () => {
  const { showNotification } = useNotification();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [items, setItems] = useState<Item[]>([]); // Items from master Items table
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<MenuItem | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Form state
  const [formItemId, setFormItemId] = useState(''); // Selected from Items table
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formBasePrice, setFormBasePrice] = useState(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [menuItemsData, itemsData, catsData, recipesData, invData, branchesData] = await Promise.all([
        api.menuItems.getAll(),
        api.items.getAll(), // Fetch from Items table
        api.categories.getAll(),
        api.recipes.getAll(),
        api.inventory.getAll(),
        api.branches.getAll(),
      ]);
      setMenuItems(menuItemsData);
      setItems(itemsData);
      setCategories(catsData);
      setRecipes(recipesData);
      setInventory(invData);
      setBranches(branchesData);
      if (branchesData.length > 0) setSelectedBranchId(branchesData[0].id || branchesData[0]._id || '');
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items from Items table that are menu_item type
  const menuItemOptions = items.filter(item => item.item_type === 'menu_item' && item.is_active);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Item selection from Items table
  const handleItemSelect = (itemId: string) => {
    setFormItemId(itemId);
    const selectedItem = items.find(i => i.id === itemId || i._id === itemId);
    if (selectedItem) {
      setFormName(selectedItem.item_name);
      setFormBasePrice(selectedItem.default_price || 0);
      if (selectedItem?.image_url) {
        setFormImageUrl(selectedItem?.image_url);
      }
      if (selectedItem.description) {
        setFormDescription(selectedItem.description);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formItemId) {
        showNotification("Please select an item from the Items catalog", "error");
        return;
      }
      if (!formCategoryId) {
        showNotification("Please select a category", "error");
        return;
      }
      if (formBasePrice <= 0) {
        showNotification("Please enter a valid price", "error");
        return;
      }
      
      const formData = new FormData();
      formData.append('item_id', formItemId);
      formData.append('name', formName);
      formData.append('category_id', formCategoryId);
      formData.append('base_price', formBasePrice.toString());
      formData.append('description', formDescription);
      formData.append('is_active', formIsActive.toString());

      if (editingItem) {
        if (imageFile) {
          formData.append('image', imageFile);
        } else if (formImageUrl) {
          formData.append('image_url', formImageUrl);
        }
        await api.menuItems.update(editingItem.id, formData);
        showNotification("Item updated successfully");
      } else {
        if (imageFile) {
          formData.append('image', imageFile);
        } else if (formImageUrl) {
          formData.append('image_url', formImageUrl);
        }
        await api.menuItems.create(formData);
        showNotification("Item created successfully");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setImageFile(null);
      fetchAllData();
    } catch (error) {
      showNotification("Failed to save item", "error");
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await api.menuItems.delete(itemToDelete.id);
        showNotification("Item deleted successfully", "warning");
        fetchAllData();
      } catch (error) {
        showNotification("Failed to delete item", "error");
      } finally {
        setItemToDelete(null);
      }
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormItemId('');
    setFormName('');
    setFormCategoryId(categories[0]?.id || categories[0]?._id || '');
    setFormBasePrice(0);
    setFormImageUrl('');
    setImageFile(null);
    setFormDescription('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormItemId(item.item_id || '');
    setFormName(item.name);
    const catId = typeof item.category_id === 'string' ? item.category_id : (item.category_id as any)?.id;
    setFormCategoryId(catId || '');
    setFormBasePrice(item.base_price);
    setFormImageUrl(item?.image_url);
    setFormDescription(item.description);
    setFormIsActive(item.is_active);
    setIsModalOpen(true);
  };

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
            {categories.map(cat => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Button className="gap-2" onClick={openCreateModal}>
          <Plus size={20} /> Add Menu Item
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading menu items...</div>
      ) : (
        <Table
          data={filteredMenuItems}
          columns={[
            {
              header: 'Item',
              accessor: (item) => (
                <div className="flex items-center gap-3">
                  <img src={item.image_url || undefined} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="font-bold text-gray-900">{item.name}</span>
                </div>
              )
            },
            {
              header: 'Category',
              accessor: (item) => {
                const categoryId = typeof item.category_id === 'string' ? item.category_id : (item.category_id as any)?.id;
                return categories.find(c => c.id === categoryId)?.name || 'N/A';
              }
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
                    onClick={() => openEditModal(item)}
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setImageFile(null);
        }}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingItem(null);
              setImageFile(null);
            }}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Selection from Items Table */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Item from Catalog *
            </label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
            >
              <option value="">-- Select an Item --</option>
              {menuItemOptions.map(item => (
                <option key={item.id || item._id} value={item.id || item._id}>
                  {item.item_name} ({item.category || 'Uncategorized'})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Items are selected from the master Items catalog. Only items with type "menu_item" are shown.
            </p>
          </div>

          <Input
            label="Item Name"
            placeholder="e.g. Pasta Carbonara"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
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
          <div className="space-y-4">
            <Input
              label="Image URL (fallback)"
              placeholder="https://..."
              value={formImageUrl}
              onChange={(e) => {
                setFormImageUrl(e.target.value);
                if (e.target.value) setImageFile(null);
              }}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                    setFormImageUrl('');
                  }
                }}
              />
            </div>
          </div>
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
                      const recipe = recipes.find(r => r.menu_item_id === viewingRecipe.id);
                      if (!recipe) return 0;
                      const branchInv = inventory.filter(i => i.branch_id === selectedBranchId);
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
                    {branches.map(b => (
                      <option key={b.id || b._id} value={b.id || b._id}>{b.name || b.branch_name}</option>
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
                    {recipes.find(r => r.menu_item_id === viewingRecipe.id)?.ingredients.map((ing, idx) => (
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

            {recipes.find(r => r.menu_item_id === viewingRecipe.id) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg border border-orange-100">
                  {recipes.find(r => r.menu_item_id === viewingRecipe.id)?.instructions}
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
        onConfirm={handleDelete}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default MenuItems;
