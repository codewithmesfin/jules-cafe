"use client";

import React, { useState, useEffect } from 'react';
import { Search, Package, History, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Edit, Coffee, Box, Plus } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

type InventoryType = 'ingredient' | 'product';

const InventoryView: React.FC = () => {
  const { showNotification } = useNotification();
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InventoryType>('ingredient');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  // Form states
  const [invForm, setInvForm] = useState({ item_id: '', item_type: 'ingredient' as InventoryType, quantity_available: 0, reorder_level: 0 });
  const [ingForm, setIngForm] = useState({ name: '', unit: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockInventory = [
        { id: '1', item_id: { name: 'Coffee Beans', unit: 'kg' }, quantity_available: 25, reorder_level: 10 },
        { id: '2', item_id: { name: 'Milk', unit: 'liters' }, quantity_available: 15, reorder_level: 20 },
        { id: '3', item_id: { name: 'Sugar', unit: 'kg' }, quantity_available: 8, reorder_level: 5 },
        { id: '4', item_id: { name: 'Flour', unit: 'kg' }, quantity_available: 45, reorder_level: 15 },
        { id: '5', item_id: { name: 'Butter', unit: 'kg' }, quantity_available: 3, reorder_level: 5 },
      ];
      const mockTransactions = [
        { id: '1', item: { name: 'Coffee Beans' }, change_quantity: 10, created_at: new Date().toISOString(), type: 'purchase' },
        { id: '2', item: { name: 'Milk' }, change_quantity: -5, created_at: new Date().toISOString(), type: 'production' },
        { id: '3', item: { name: 'Sugar' }, change_quantity: 2, created_at: new Date().toISOString(), type: 'purchase' },
      ];
      setInventory(mockInventory);
      setTransactions(mockTransactions);
    } catch (error: any) {
      showNotification('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventory = async () => {
    try {
      showNotification('Stock entry saved');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error saving stock', 'error');
    }
  };

  const handleSaveIngredient = async () => {
    try {
      showNotification('Ingredient created successfully');
      setIsIngModalOpen(false);
      setIngForm({ name: '', unit: '' });
    } catch (error: any) {
      showNotification(error.message || 'Error creating ingredient', 'error');
    }
  };

  const openInvModal = (inv: any = null) => {
    setSelectedInventory(inv);
    if (inv) {
      setInvForm({ item_id: inv.item_id?.name || '', item_type: activeTab, quantity_available: inv.quantity_available, reorder_level: inv.reorder_level });
    } else {
      setInvForm({ item_id: '', item_type: activeTab, quantity_available: 0, reorder_level: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredInventory = inventory.filter(item => {
    const name = item.item_id?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const lowStockCount = filteredInventory.filter(i => (i.quantity_available || 0) <= (i.reorder_level || 0)).length;
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, i) => sum + (i.quantity_available || 0), 0);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm">Track stock levels for ingredients and products</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-xl inline-flex border border-slate-200">
        <button
          onClick={() => setActiveTab('ingredient')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'ingredient' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Coffee size={16} /> Ingredients
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'product' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Box size={16} /> Products
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              {activeTab === 'ingredient' ? <Coffee size={20} /> : <Package size={20} />}
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Items</p>
              <p className="text-xl font-bold text-slate-900">{totalItems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Quantity</p>
              <p className="text-xl font-bold text-slate-900">{totalQuantity}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Low Stock</p>
              <p className="text-xl font-bold text-slate-900">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Transactions</p>
              <p className="text-xl font-bold text-slate-900">{transactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'ingredient' && (
            <Button variant="outline" onClick={() => setIsIngModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Ingredient
            </Button>
          )}
          <Button onClick={() => openInvModal()}>
            <Plus size={16} className="mr-1" /> Add Stock
          </Button>
        </div>
      </div>

      {/* Inventory Cards - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No {activeTab} stock entries found</p>
            <Button variant="outline" className="mt-4" onClick={() => openInvModal()}>
              Add first stock entry
            </Button>
          </div>
        ) : (
          filteredInventory.map((item) => {
            const isLow = (item.quantity_available || 0) <= (item.reorder_level || 0);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      {activeTab === 'ingredient' ? (
                        <Coffee size={18} className="text-slate-600" />
                      ) : (
                        <Package size={18} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.item_id?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{item.item_id?.unit || 'units'}</p>
                    </div>
                  </div>
                  {isLow && <Badge variant="warning" size="sm">Low Stock</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Quantity</p>
                    <p className={cn("text-lg font-bold", isLow ? "text-amber-600" : "text-slate-900")}>
                      {item.quantity_available || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">Reorder At</p>
                    <p className="text-lg font-bold text-slate-900">{item.reorder_level || 0}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => openInvModal(item)}>
                  <Edit size={14} className="mr-1" /> Update Stock
                </Button>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Activity" subtitle="Latest inventory movements">
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History size={32} className="mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((t, idx) => {
              const isPositive = (t.change_quantity || 0) > 0;
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{t.item?.name || 'Item'}</p>
                    <p className="text-xs text-slate-500">
                      {isPositive ? '+' : '-'}{Math.abs(t.change_quantity || 0)} units
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Stock Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInventory ? 'Update Stock' : 'Add Stock Entry'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveInventory}>{selectedInventory ? 'Update' : 'Add'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {!selectedInventory && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select {activeTab === 'ingredient' ? 'Ingredient' : 'Product'}</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={invForm.item_id}
                onChange={(e) => setInvForm({ ...invForm, item_id: e.target.value })}
              >
                <option value="">Choose...</option>
                <option value="1">Coffee Beans (kg)</option>
                <option value="2">Milk (liters)</option>
                <option value="3">Sugar (kg)</option>
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

      {/* New Ingredient Modal */}
      <Modal
        isOpen={isIngModalOpen}
        onClose={() => setIsIngModalOpen(false)}
        title="Add New Ingredient"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsIngModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveIngredient}>Create</Button>
          </div>
        }
      >
        <div className="space-y-4">
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
