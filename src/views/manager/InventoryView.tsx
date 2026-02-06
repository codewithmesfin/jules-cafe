"use client";

import React, { useState, useEffect } from 'react';
import { Search, Package, History, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Coffee, Box, Plus, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../utils/cn';
import type { Inventory, Ingredient, Product } from '../../types';

interface Unit {
  id: string;
  _id: string;
  name: string;
}

type InventoryType = 'ingredient' | 'product';

// Helper to safely get item ID from both old (ingredient_id) and new (item_id) formats
const getItemId = (item: any): string => {
  if (!item) return '';
  if (typeof item.item_id === 'string') return item.item_id;
  if (typeof item.item_id === 'object') {
    return item.item_id.id || item.item_id._id || '';
  }
  // Fallback to old ingredient_id format
  if (typeof item.ingredient_id === 'string') return item.ingredient_id;
  if (typeof item.ingredient_id === 'object') {
    return item.ingredient_id.id || item.ingredient_id._id || '';
  }
  return '';
};

// Helper to safely get item name from populated item_id
const getTransactionItemName = (transaction: any): string => {
  if (!transaction.item_id) return 'Unknown Item';
  // When populated, item_id is an object with _id, id, and name
  const item = transaction.item_id;
  return item.name || item._id?.toString() || 'Unknown Item';
};

// Helper to get item name
const getItemName = (item: any, type: InventoryType, ingredients: Ingredient[], products: Product[]): string => {
  const itemId = getItemId(item);
  if (type === 'ingredient') {
    const ing = ingredients.find(i => (i.id === itemId || i._id === itemId));
    return ing?.name || 'Unknown Ingredient';
  } else {
    const prod = products.find(p => (p.id === itemId || p._id === itemId));
    return prod?.name || 'Unknown Product';
  }
};

// Helper to get item unit
const getItemUnit = (item: any, type: InventoryType, ingredients: Ingredient[]): string => {
  const itemId = getItemId(item);
  if (type === 'ingredient') {
    const ing = ingredients.find(i => (i.id === itemId || i._id === itemId));
    return ing?.unit || 'units';
  }
  return 'pcs';
};

const InventoryView: React.FC = () => {
  const { showNotification } = useNotification();
  const { canCreate } = usePermission();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InventoryType>('ingredient');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // Form states
  const [invForm, setInvForm] = useState({
    item_id: '',
    item_type: 'ingredient' as InventoryType,
    quantity_available: 0,
    reorder_level: 0,
    unit: ''
  });

  const [units, setUnits] = useState<Unit[]>([]);

  const [ingForm, setIngForm] = useState({
    name: '',
    unit: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, ingRes, prodRes, transRes, unitsRes] = await Promise.all([
        api.inventory.getAll(),
        api.ingredients.getAll(),
        api.products.getAll(),
        api.inventory.getTransactions(),
        api.settings.getUnits()
      ]);

      // Ensure inventory is an array
      const invData = Array.isArray(invRes) ? invRes : (invRes?.data || []);
      setInventory(invData);
      setIngredients(Array.isArray(ingRes) ? ingRes : (ingRes?.data || []));
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      setTransactions(Array.isArray(transRes) ? transRes : (transRes?.data || []));
      setUnits(Array.isArray(unitsRes) ? unitsRes : unitsRes.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventory = async () => {
    if (!invForm.unit) {
      showNotification('Please select a unit for the stock entry', 'error');
      return;
    }

    try {
      if (selectedInventory) {
        // Add to existing stock using addStock endpoint (creates transaction)
        await api.inventory.addStock({
          item_id: invForm.item_id,
          item_type: invForm.item_type,
          quantity: invForm.quantity_available,
          unit: invForm.unit,
          note: 'Stock adjustment'
        });
        showNotification('Stock added successfully');
      } else {
        // Create new inventory with reorder_level, then add initial stock
        await api.inventory.create({
          item_id: invForm.item_id,
          item_type: invForm.item_type,
          quantity_available: invForm.quantity_available,
          reorder_level: invForm.reorder_level,
          unit: invForm.unit
        });
        showNotification('Stock entry added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error saving stock', 'error');
    }
  };

  const handleSaveIngredient = async () => {
    try {
      await api.ingredients.create(ingForm);
      showNotification('Ingredient created successfully');
      setIsIngModalOpen(false);
      setIngForm({ name: '', unit: '' });
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error creating ingredient', 'error');
    }
  };

  const openInvModal = (inv: Inventory | null = null) => {
    setSelectedInventory(inv);
    if (inv) {
      const itemId = getItemId(inv);
      setInvForm({
        item_id: itemId,
        item_type: activeTab,
        quantity_available: 0,
        reorder_level: inv.reorder_level,
        unit: ''
      });
    } else {
      setInvForm({ item_id: '', item_type: activeTab, quantity_available: 0, reorder_level: 0, unit: '' });
    }
    setIsModalOpen(true);
  };

  // Get the base unit for an ingredient (for display purposes)
  const getIngredientBaseUnit = (ingredientId: string): string => {
    const ingredient = ingredients.find(i => (i.id === ingredientId || i._id === ingredientId));
    if (ingredient) {
      // Check if unit is populated
      const unitId = (ingredient as any).unit_id;
      if (typeof unitId === 'object' && unitId?.name) {
        return unitId.name;
      }
      // Find unit from units list
      const unit = units.find(u => u.id === unitId || u._id === unitId);
      return unit?.name || '';
    }
    return '';
  };

  const filteredInventory = inventory.filter(item => {
    // Filter by tab type (ingredient vs product)
    if (item.item_type !== activeTab) return false;
    
    // Filter by search term
    const itemId = getItemId(item);
    if (!itemId) return false;
    
    const name = getItemName(item, activeTab, ingredients, products);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const lowStockCount = filteredInventory.filter(i => {
    return (i.quantity_available || 0) <= (i.reorder_level || 0);
  }).length;
  
  const totalStockValue = filteredInventory.reduce((sum, i) => sum + (i.quantity_available || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Track stock levels for ingredients and finished products</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-xl inline-flex border border-gray-200">
        <button
          onClick={() => setActiveTab('ingredient')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'ingredient' ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Coffee size={16} /> Ingredients
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'product' ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Box size={16} /> Finished Products
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              {activeTab === 'ingredient' ? <Coffee size={20} /> : <Package size={20} />}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{filteredInventory.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">In Stock</p>
              <p className="text-xl font-bold text-gray-900">{totalStockValue}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Low Stock</p>
              <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center">
              <History size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Transactions</p>
              <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <button 
              onClick={() => fetchData()}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Inventory Table */}
        <div className="flex-1 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {canCreate('inventory') && (
                <Button onClick={() => openInvModal()}>
                  <Plus size={16} className="mr-1" /> Add Stock
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                <p className="text-gray-500">No {activeTab} stock entries found</p>
                {canCreate('inventory') && (
                  <Button variant="outline" className="mt-3" onClick={() => openInvModal()}>
                    Add first stock entry
                  </Button>
                )}
              </div>
            ) : (
              <Table
                data={filteredInventory}
                columns={[
                  {
                    header: activeTab === 'ingredient' ? 'Ingredient' : 'Product',
                    accessor: (item) => {
                      const itemId = getItemId(item);
                      const name = getItemName(item, activeTab, ingredients, products);
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {activeTab === 'ingredient' ? (
                              <Coffee size={18} className="text-gray-600" />
                            ) : (
                              <Package size={18} className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{getItemUnit(item, activeTab, ingredients)}</p>
                          </div>
                        </div>
                      );
                    }
                  },
                  {
                    header: 'Quantity',
                    accessor: (item) => {
                      const isLow = (item.quantity_available || 0) <= (item.reorder_level || 0);
                      return (
                        <div className="flex flex-col gap-1">
                          <span className={cn("font-semibold", isLow ? "text-amber-600" : "text-gray-900")}>
                            {item.quantity_available || 0}
                          </span>
                          {isLow && (
                            <Badge variant="warning" className="text-[10px] w-fit">Low</Badge>
                          )}
                        </div>
                      );
                    }
                  },
                  {
                    header: 'Reorder',
                    accessor: (item) => <span className="text-gray-500">{item.reorder_level || 0}</span>
                  },
                  {
                    header: 'Actions',
                    accessor: (item) => (
                      <button
                        onClick={() => openInvModal(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                        title="Add more stock"
                      >
                        <Plus size={16} />
                      </button>
                    )
                  }
                ]}
              />
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="w-full lg:w-80">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History size={18} /> Recent Activity ({transactions.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>
              ) : (
                transactions.map((t, idx) => {
                  const isPositive = (t.change_quantity || 0) > 0;
                  const itemName = getTransactionItemName(t);
                  const itemType = t.item_type === 'ingredient' ? 'Ingredient' : 'Product';
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{itemName}</p>
                        <p className="text-xs text-gray-500">{itemType}</p>
                        <p className="text-xs text-gray-400">
                          {isPositive ? '+' : '-'}{Math.abs(t.change_quantity || 0)} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {transactions.length > 10 && (
              <button
                onClick={() => fetchData()}
                className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh to see more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stock Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInventory ? `Add Stock to ${getItemName(selectedInventory, activeTab, ingredients, products)}` : 'Add Stock Entry'}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveInventory} className="flex-1">
              {selectedInventory ? `Add ${invForm.quantity_available}` : 'Add Entry'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {!selectedInventory && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {activeTab === 'ingredient' ? 'Ingredient' : 'Product'}
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={invForm.item_id}
                  onChange={(e) => setInvForm({ ...invForm, item_id: e.target.value })}
                >
                  <option value="">Choose...</option>
                  {activeTab === 'ingredient' ? (
                    ingredients.map(i => {
                      const ingId = i.id || i._id;
                      return (
                      <option key={ingId} value={ingId}>
                        {i.name} ({getIngredientBaseUnit(ingId || '')})
                      </option>
                    )})
                  ) : (
                    products.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <Input
                label="Reorder Level"
                type="number"
                min="0"
                placeholder="Alert when stock falls below"
                value={invForm.reorder_level || ''}
                onChange={(e) => setInvForm({ ...invForm, reorder_level: parseFloat(e.target.value) || 0 })}
              />
            </>
          )}

          {/* Unit Selector for all stock entries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={invForm.unit}
              onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })}
            >
              <option value="">Select Unit</option>
              {units.map(unit => (
                <option key={unit.id || unit._id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity to Add"
            type="number"
            min="0"
            placeholder="Enter quantity to add"
            value={invForm.quantity_available || ''}
            onChange={(e) => setInvForm({ ...invForm, quantity_available: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </Modal>

      {/* New Ingredient Modal */}
      <Modal
        isOpen={isIngModalOpen}
        onClose={() => setIsIngModalOpen(false)}
        title="Add New Ingredient"
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsIngModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveIngredient} className="flex-1">
              Create
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Ingredient Name"
            placeholder="e.g., Coffee Beans, Milk"
            value={ingForm.name}
            onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
          />
          <Input
            label="Unit"
            placeholder="e.g., kg, liters, pieces"
            value={ingForm.unit}
            onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default InventoryView;
