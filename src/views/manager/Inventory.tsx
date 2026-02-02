"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, History, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { InventoryItem as InventoryItemType, Recipe, Item } from '../../types';

interface InventoryFormData {
  item_id: string;
  item_name: string;
  category: string;
  unit: string;
  quantity: number;
  min_stock: number;
}

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItemType[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);

  // Form state
  const [formItemId, setFormItemId] = useState('');
  const [formItemName, setFormItemName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formQuantity, setFormQuantity] = useState(0);
  const [formMinStock, setFormMinStock] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user?.branch_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invData, recData, itemsData] = await Promise.all([
        api.inventory.getAll(),
        api.recipes.getAll(),
        api.items.getAll(),
      ]);
      setInventory(invData);
      setRecipes(recData);
      setAllItems(itemsData);
    } catch (error: any) {
      console.error('Failed to fetch inventory:', error);
      showNotification(error.message || 'Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get inventory items from the master Items table (item_type = 'inventory')
  const inventoryItems = allItems.filter(item => item.item_type === 'inventory' && item.is_active);

  const handleOpenModal = (item: InventoryItemType | null = null) => {
    setSelectedItem(item);
    if (item) {
      // Editing existing inventory item
      setFormItemId((item as any).item_id || '');
      setFormItemName(item.item_name);
      setFormCategory(item.category);
      setFormUnit(item.unit);
      setFormQuantity(0);
      setFormMinStock(item.min_stock || 0);
    } else {
      // Creating new inventory item
      setFormItemId('');
      setFormItemName('');
      setFormCategory('');
      setFormUnit('');
      setFormQuantity(0);
      setFormMinStock(0);
    }
    setIsModalOpen(true);
  };

  const handleItemSelect = (itemId: string) => {
    setFormItemId(itemId);
    const selectedItemData = allItems.find(i => i.id === itemId || i._id === itemId);
    if (selectedItemData) {
      setFormItemName(selectedItemData.item_name);
      setFormCategory(selectedItemData.category || '');
      setFormUnit(selectedItemData.unit || '');
      setFormMinStock(0);
    }
  };

  const handleSave = async () => {
    try {
      if (!formItemId && !selectedItem) {
        showNotification('Please select an item from the Items catalog', 'error');
        return;
      }

      if (selectedItem) {
        // Update: quantity in form is DELTA (positive to add, negative to remove)
        await api.inventory.update(selectedItem.id, {
          quantity: formQuantity,
          min_stock: formMinStock
        });
        showNotification('Inventory updated');
      } else {
        // Create new inventory item
        await api.inventory.create({
          branch_id: user?.branch_id,
          item_id: formItemId,
          item_name: formItemName,
          category: formCategory,
          quantity: formQuantity,
          unit: formUnit,
          min_stock: formMinStock
        });
        showNotification('Item added to inventory');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to save inventory item', 'error');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-[#e60023] rounded-full">
          <Package size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Items</p>
            <h3 className="text-2xl font-bold">{inventory.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-orange-200 bg-orange-50">
          <div className="p-3 bg-orange-100 text-[#e60023] rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low Stock</p>
            <h3 className="text-2xl font-bold">
              {inventory.filter(i => i.quantity <= i.min_stock).length}
            </h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <History size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Last Update</p>
            <h3 className="text-lg font-bold">Recently</h3>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading inventory...</div>
      ) : (
        <Table
          data={filteredInventory}
          columns={[
            {
              header: 'Item Name',
              accessor: (i) => (
                <span className="font-bold text-gray-900">{i.item_name}</span>
              )
            },
            { header: 'Category', accessor: 'category' },
            {
              header: 'Quantity',
              accessor: (i) => (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={i.quantity <= i.min_stock ? 'text-red-600 font-bold' : 'text-gray-900'}>
                      {i.quantity} {i.unit}
                    </span>
                    {i.quantity <= i.min_stock && <AlertTriangle size={14} className="text-red-600" />}
                  </div>
                  {i.quantity <= i.min_stock && (
                    <Badge variant="error" className="mt-1 text-[10px] py-0">Purchase Required</Badge>
                  )}
                </div>
              )
            },
            { header: 'Min Stock', accessor: (i) => `${i.min_stock} ${i.unit}` },
            {
              header: 'Last Updated',
              accessor: (i) => new Date(i.last_updated || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
            },
            {
              header: 'Actions',
              accessor: (i) => (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(i)}>
                    Update Stock
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? `Update Stock: ${selectedItem.item_name}` : 'Add Inventory Item'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!selectedItem ? (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Item from Catalog *
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                  value={formItemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                >
                  <option value="">-- Select an Item --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id || item._id} value={item.id || item._id}>
                      {item.item_name} ({item.category || 'Uncategorized'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Items are selected from the master Items catalog. Only items with type "inventory" are shown.
                </p>
              </div>
              <Input
                label="Item Name"
                placeholder="Auto-filled from selection"
                value={formItemName}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Category"
                placeholder="Auto-filled from selection"
                value={formCategory}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Unit"
                placeholder="Auto-filled from selection"
                value={formUnit}
                disabled
                className="bg-gray-50"
              />
            </>
          ) : null}
          <Input
            label={selectedItem ? "Add/Remove Quantity" : "Initial Quantity"}
            type="number"
            placeholder="0"
            value={formQuantity}
            onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 0)}
          />
          {selectedItem && (
            <p className="text-xs text-gray-500">
              Current quantity: {selectedItem.quantity} {selectedItem.unit}. Enter a positive number to add, negative to remove.
            </p>
          )}
          <Input
            label="Minimum Stock Level"
            type="number"
            value={formMinStock}
            onChange={(e) => setFormMinStock(parseFloat(e.target.value) || 0)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
