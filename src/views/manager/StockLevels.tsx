"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, TrendingUp, Edit } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Inventory, Ingredient, Product } from '../../types';

type InventoryType = 'ingredient' | 'product';

const StockLevelsView: React.FC = () => {
  const { showNotification } = useNotification();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InventoryType>('ingredient');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  const [invForm, setInvForm] = useState({
    item_id: '',
    quantity_available: 0,
    reorder_level: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, ingRes, prodRes] = await Promise.all([
        api.inventory.getAll(),
        api.ingredients.getAll(),
        api.products.getAll()
      ]);
      setInventory(Array.isArray(invRes) ? invRes : invRes.data || []);
      setIngredients(Array.isArray(ingRes) ? ingRes : ingRes.data || []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getItemId = (item: any): string => {
    if (!item) return '';
    if (typeof item.item_id === 'string') return item.item_id;
    if (typeof item.item_id === 'object') {
      return item.item_id.id || item.item_id._id || '';
    }
    return '';
  };

  const getItemName = (item: any, type: InventoryType): string => {
    const itemId = getItemId(item);
    if (type === 'ingredient') {
      const ing = ingredients.find(i => (i.id === itemId || i._id === itemId));
      return ing?.name || 'Unknown';
    } else {
      const prod = products.find(p => (p.id === itemId || p._id === itemId));
      return prod?.name || 'Unknown';
    }
  };

  const getItemUnit = (item: any, type: InventoryType): string => {
    const itemId = getItemId(item);
    if (type === 'ingredient') {
      const ing = ingredients.find(i => (i.id === itemId || i._id === itemId));
      return ing?.unit || 'units';
    }
    return 'pcs';
  };

  const handleSaveInventory = async () => {
    if (!invForm.item_id) {
      showNotification('Please select an item', 'error');
      return;
    }

    try {
      const data = {
        item_id: invForm.item_id,
        item_type: activeTab,
        quantity_available: invForm.quantity_available,
        reorder_level: invForm.reorder_level
      };

      if (selectedInventory) {
        await api.inventory.update((selectedInventory.id || (selectedInventory as any)._id)!, {
          quantity_available: invForm.quantity_available,
          reorder_level: invForm.reorder_level
        });
        showNotification('Stock updated successfully');
      } else {
        await api.inventory.create(data);
        showNotification('Stock entry added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error saving stock', 'error');
    }
  };

  const openInvModal = (inv: Inventory | null = null) => {
    setSelectedInventory(inv);
    if (inv) {
      const itemId = getItemId(inv);
      setInvForm({
        item_id: itemId,
        quantity_available: inv.quantity_available,
        reorder_level: inv.reorder_level
      });
    } else {
      setInvForm({ item_id: '', quantity_available: 0, reorder_level: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredInventory = inventory.filter(item => {
    const itemId = getItemId(item);
    if (!itemId) return false;
    const name = getItemName(item, activeTab);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const lowStockCount = filteredInventory.filter(i => (i.quantity_available || 0) <= (i.reorder_level || 0)).length;
  const totalStockValue = filteredInventory.reduce((sum, i) => sum + (i.quantity_available || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Levels</h1>
          <p className="text-slate-500">Monitor inventory quantities and reorder points</p>
        </div>
        <Button onClick={() => openInvModal()}>
          <Plus size={18} className="mr-2" /> Add Stock Entry
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-xl inline-flex border border-slate-200">
        <button
          onClick={() => setActiveTab('ingredient')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'ingredient' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          Ingredients
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'product' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          Finished Products
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Items</p>
              <p className="text-xl font-bold text-slate-900">{filteredInventory.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">In Stock</p>
              <p className="text-xl font-bold text-slate-900">{totalStockValue}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Low Stock</p>
              <p className="text-xl font-bold text-slate-900">{lowStockCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={`Search ${activeTab} stock...`}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-500">No stock entries found</p>
            <Button variant="outline" className="mt-3" onClick={() => openInvModal()}>
              Add first stock entry
            </Button>
          </div>
        ) : (
          <Table
            data={filteredInventory}
            columns={[
              {
                header: activeTab === 'ingredient' ? 'Ingredient' : 'Product',
                accessor: (item) => {
                  const name = getItemName(item, activeTab);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package size={18} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{getItemUnit(item, activeTab)}</p>
                      </div>
                    </div>
                  );
                }
              },
              {
                header: 'Available',
                accessor: (item) => {
                  const isLow = (item.quantity_available || 0) <= (item.reorder_level || 0);
                  return (
                    <div className="flex flex-col gap-1">
                      <span className={cn("font-semibold", isLow ? "text-amber-600" : "text-green-600")}>
                        {item.quantity_available || 0}
                      </span>
                      {isLow && <Badge variant="warning" className="text-[10px] w-fit">Low</Badge>}
                    </div>
                  );
                }
              },
              {
                header: 'Reorder Level',
                accessor: (item) => <span className="text-slate-500">{item.reorder_level || 0}</span>
              },
              {
                header: 'Actions',
                accessor: (item) => (
                  <button
                    onClick={() => openInvModal(item)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                )
              }
            ]}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInventory ? 'Edit Stock' : 'Add Stock Entry'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveInventory} className="flex-1">
              {selectedInventory ? 'Update' : 'Add'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {!selectedInventory && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select {activeTab === 'ingredient' ? 'Ingredient' : 'Product'}
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={invForm.item_id}
                onChange={(e) => setInvForm({ ...invForm, item_id: e.target.value })}
              >
                <option value="">Choose...</option>
                {activeTab === 'ingredient' ? (
                  ingredients.map(i => (
                    <option key={i.id || i._id} value={i.id || i._id}>
                      {i.name} ({i.unit})
                    </option>
                  ))
                ) : (
                  products.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
          <Input
            label="Quantity"
            type="number"
            min="0"
            value={invForm.quantity_available || ''}
            onChange={(e) => setInvForm({ ...invForm, quantity_available: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Reorder Level"
            type="number"
            min="0"
            value={invForm.reorder_level || ''}
            onChange={(e) => setInvForm({ ...invForm, reorder_level: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StockLevelsView;
