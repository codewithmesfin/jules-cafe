"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, History, AlertTriangle, TrendingUp, Filter, ArrowUpRight, ArrowDownRight, MoreVertical, Edit } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Inventory, Ingredient } from '../../types';

const InventoryView: React.FC = () => {
  const { showNotification } = useNotification();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // Form states
  const [invForm, setInvForm] = useState({
    ingredient_id: '',
    quantity_available: 0,
    reorder_level: 0
  });

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
      const [invRes, ingRes, transRes] = await Promise.all([
        api.inventory.getAll(),
        api.ingredients.getAll(),
        api.inventory.getTransactions()
      ]);
      setInventory(Array.isArray(invRes) ? invRes : invRes.data || []);
      setIngredients(Array.isArray(ingRes) ? ingRes : ingRes.data || []);
      setTransactions(Array.isArray(transRes) ? transRes : transRes.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventory = async () => {
    try {
      if (selectedInventory) {
        await api.inventory.update((selectedInventory.id || (selectedInventory as any)._id)!, {
          quantity_available: invForm.quantity_available,
          reorder_level: invForm.reorder_level
        });
        showNotification('Inventory updated');
      } else {
        await api.inventory.create(invForm);
        showNotification('Item added to inventory');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error saving inventory', 'error');
    }
  };

  const handleSaveIngredient = async () => {
    try {
      await api.ingredients.create(ingForm);
      showNotification('Ingredient created');
      setIsIngModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Error creating ingredient', 'error');
    }
  };

  const openInvModal = (inv: Inventory | null = null) => {
    setSelectedInventory(inv);
    if (inv) {
      setInvForm({
        ingredient_id: typeof inv.ingredient_id === 'string' ? inv.ingredient_id : (inv.ingredient_id as any).id || (inv.ingredient_id as any)._id,
        quantity_available: inv.quantity_available,
        reorder_level: inv.reorder_level
      });
    } else {
      setInvForm({ ingredient_id: '', quantity_available: 0, reorder_level: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredInventory = inventory.filter(item => {
    const ingredientId = typeof item.ingredient_id === 'string' ? item.ingredient_id : (item.ingredient_id as any).id || (item.ingredient_id as any)._id;
    const ing = ingredients.find(i => (i.id === ingredientId || i._id === ingredientId));
    return ing?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-slate-100 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm border">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Items</p>
            <h3 className="text-2xl font-black text-slate-900">{inventory.length}</h3>
          </div>
        </Card>
        <Card className="bg-white border-slate-100 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm border">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Levels</p>
            <h3 className="text-2xl font-black text-slate-900">
              {inventory.filter(i => i.quantity_available <= i.reorder_level).length}
            </h3>
          </div>
        </Card>
        <Card className="bg-white border-slate-100 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm border">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ingredients</p>
            <h3 className="text-2xl font-black text-slate-900">{ingredients.length}</h3>
          </div>
        </Card>
        <Card className="bg-white border-slate-100 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm border">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Movements</p>
            <h3 className="text-2xl font-black text-slate-900">{transactions.length}</h3>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Inventory Table */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                placeholder="Search inventory assets..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsIngModalOpen(true)}
                className="rounded-xl border-slate-100 font-black h-12 px-6"
              >
                Register Ingredient
              </Button>
              <Button
                onClick={() => openInvModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 font-black shadow-lg shadow-blue-100"
              >
                Assign Stock
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table
                data={filteredInventory}
                columns={[
                  {
                    header: 'Ingredient',
                    accessor: (i) => {
                      const ingredientId = typeof i.ingredient_id === 'string' ? i.ingredient_id : (i.ingredient_id as any).id || (i.ingredient_id as any)._id;
                      const ing = ingredients.find(ing => (ing.id === ingredientId || ing._id === ingredientId));
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400">
                             {ing?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none mb-1">{ing?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ing?.unit || 'units'}</p>
                          </div>
                        </div>
                      );
                    }
                  },
                  {
                    header: 'Available Level',
                    accessor: (i) => {
                      const ingredientId = typeof i.ingredient_id === 'string' ? i.ingredient_id : (i.ingredient_id as any).id || (i.ingredient_id as any)._id;
                      const ing = ingredients.find(ing => (ing.id === ingredientId || ing._id === ingredientId));
                      const isLow = i.quantity_available <= i.reorder_level;
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-black text-xl", isLow ? "text-rose-600" : "text-slate-900")}>
                              {i.quantity_available}
                            </span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ing?.unit}</span>
                          </div>
                          {isLow && <Badge className="bg-rose-50 text-rose-600 border-rose-100 text-[9px] font-black uppercase py-0.5 px-2 w-fit">Critical</Badge>}
                        </div>
                      );
                    }
                  },
                  {
                    header: 'Safety Stock',
                    accessor: (i) => <span className="text-slate-500 font-black text-xs">{i.reorder_level} units</span>
                  },
                  {
                    header: 'Control',
                    accessor: (i) => (
                      <button
                        onClick={() => openInvModal(i)}
                        className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"
                      >
                        <Edit size={18} />
                      </button>
                    )
                  }
                ]}
              />
            )}
          </div>
        </div>

        {/* Transactions Sidebar */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col h-full max-h-[700px] border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Activity Log</h3>
              <div className="p-2 bg-slate-50 rounded-lg">
                <History size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar pr-2">
              {transactions.length === 0 ? (
                <div className="text-center py-20">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History size={24} className="text-slate-200" />
                   </div>
                   <p className="text-slate-400 font-bold text-sm">No recent movement</p>
                </div>
              ) : (
                transactions.map((t, idx) => {
                  const isPositive = t.change_quantity > 0;
                  return (
                    <div key={idx} className="flex gap-4 p-4 hover:bg-slate-50/50 rounded-[1.5rem] transition-colors border border-transparent hover:border-slate-50">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        isPositive ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {isPositive ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900 truncate">{(t.ingredient_id as any)?.name || 'Inventory Asset'}</p>
                        <p className="text-xs text-slate-500 font-bold">
                          {isPositive ? 'Stock Inflow' : 'Stock Outflow'} • {Math.abs(t.change_quantity)} units
                        </p>
                        <div className="flex items-center justify-between mt-2">
                           <Badge variant="neutral" className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-2">
                              {t.reference_type}
                           </Badge>
                           <span className="text-[10px] text-slate-300 font-bold">{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInventory ? "Modify Stock Record" : "Assign Inventory Asset"}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
            <Button onClick={handleSaveInventory} className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100 font-black">
              Sync Levels
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          {!selectedInventory && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Source Ingredient</label>
              <select
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                value={invForm.ingredient_id}
                onChange={(e) => setInvForm({ ...invForm, ingredient_id: e.target.value })}
              >
                <option value="">Choose Asset...</option>
                {ingredients.map(i => (
                  <option key={i.id || (i as any)._id} value={i.id || (i as any)._id}>{i.name} ({i.unit})</option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Current On-Hand Quantity"
            type="number"
            className="rounded-xl h-12"
            value={invForm.quantity_available || ''}
            onChange={(e) => setInvForm({ ...invForm, quantity_available: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Safety Threshold (Reorder level)"
            type="number"
            className="rounded-xl h-12"
            value={invForm.reorder_level || ''}
            onChange={(e) => setInvForm({ ...invForm, reorder_level: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </Modal>

      {/* New Ingredient Modal */}
      <Modal
        isOpen={isIngModalOpen}
        onClose={() => setIsIngModalOpen(false)}
        title="New Master Ingredient"
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsIngModalOpen(false)} className="flex-1 rounded-xl h-12">Discard</Button>
            <Button onClick={handleSaveIngredient} className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100 font-black">
              Add to Catalog
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Descriptive Name *"
            placeholder="e.g. Ground Coffee, Fresh Milk"
            className="rounded-xl h-12"
            value={ingForm.name}
            onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
          />
          <Input
            label="Measurement Unit *"
            placeholder="e.g. KG, Liters, Bags"
            className="rounded-xl h-12"
            value={ingForm.unit}
            onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value })}
          />
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default InventoryView;
