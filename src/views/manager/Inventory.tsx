"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, History, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { InventoryItem, Recipe } from '../../types';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form state
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
      const [invData, recData] = await Promise.all([
        api.inventory.getAll(),
        api.recipes.getAll(),
      ]);
      setInventory(invData.filter((i: InventoryItem) => {
        const bId = typeof i.branch_id === 'string' ? i.branch_id : (i.branch_id as any)?.id;
        return bId === user?.branch_id;
      }));
      setRecipes(recData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const suggestedItems = Array.from(new Set(
    recipes.flatMap(r => r.ingredients.map(i => i.item_name))
  )).sort();

  const handleOpenModal = (item: InventoryItem | null = null) => {
    setSelectedItem(item);
    if (item) {
      setFormItemName(item.item_name);
      setFormCategory(item.category);
      setFormUnit(item.unit);
      setFormQuantity(0);
      setFormMinStock(item.min_stock);
    } else {
      setFormItemName(suggestedItems[0] || '');
      setFormCategory('');
      setFormUnit('');
      setFormQuantity(0);
      setFormMinStock(0);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedItem) {
        // Update: quantity in form is DELTA
        const newQuantity = selectedItem.quantity + formQuantity;
        await api.inventory.update(selectedItem.id, {
          quantity: Math.max(0, newQuantity),
          min_stock: formMinStock
        });
        showNotification('Inventory updated');
      } else {
        await api.inventory.create({
          branch_id: user?.branch_id,
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
    } catch (error) {
      showNotification('Failed to save inventory item', 'error');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
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
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
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
                <div className="flex items-center gap-2">
                  <span className={i.quantity <= i.min_stock ? 'text-red-600 font-bold' : 'text-gray-900'}>
                    {i.quantity} {i.unit}
                  </span>
                  {i.quantity <= i.min_stock && <AlertTriangle size={14} className="text-red-600" />}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formItemName}
                  onChange={(e) => setFormItemName(e.target.value)}
                >
                  <option value="">Select an Item</option>
                  {suggestedItems.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="other">Other (New Ingredient)</option>
                </select>
              </div>
              {formItemName === 'other' && (
                <Input
                  label="Custom Item Name"
                  placeholder="e.g. Tomato Sauce"
                  onChange={(e) => setFormItemName(e.target.value)}
                />
              )}
              <Input
                label="Category"
                placeholder="e.g. Canned Goods"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
              <Input
                label="Unit"
                placeholder="e.g. kg, liters, units"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
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
