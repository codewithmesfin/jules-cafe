"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Coffee, Edit, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import type { Ingredient } from '../../types';

const IngredientsListView: React.FC = () => {
  const { showNotification } = useNotification();
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    cost_per_unit: 0,
    sku: '',
    is_active: true
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await api.ingredients.getAll();
      setIngredients(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch ingredients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.unit) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingIngredient) {
        await api.ingredients.update(editingIngredient.id || editingIngredient._id!, formData);
        showNotification('Ingredient updated successfully');
      } else {
        await api.ingredients.create(formData);
        showNotification('Ingredient created successfully');
      }
      setIsModalOpen(false);
      setEditingIngredient(null);
      setFormData({ name: '', unit: '', cost_per_unit: 0, sku: '', is_active: true });
      fetchIngredients();
    } catch (error: any) {
      showNotification(error.message || 'Failed to save ingredient', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await api.ingredients.delete(id);
        showNotification('Ingredient deleted', 'warning');
        fetchIngredients();
      } catch (error: any) {
        showNotification(error.message || 'Failed to delete ingredient', 'error');
      }
    }
  };

  const openModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        unit: ingredient.unit,
        cost_per_unit: (ingredient as any).cost_per_unit || 0,
        sku: (ingredient as any).sku || '',
        is_active: (ingredient as any).is_active !== false
      });
    } else {
      setEditingIngredient(null);
      setFormData({ name: '', unit: '', cost_per_unit: 0, sku: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ingredients</h1>
          <p className="text-slate-500">Manage your ingredient catalog</p>
        </div>
        {canCreate('ingredients') && (
          <Button onClick={() => openModal()}>
            <Plus size={18} className="mr-2" /> Add Ingredient
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search ingredients..."
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
        ) : filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="mx-auto h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-500">No ingredients found</p>
            {canCreate('ingredients') && (
              <Button variant="outline" className="mt-3" onClick={() => openModal()}>
                Add your first ingredient
              </Button>
            )}
          </div>
        ) : (
          <Table
            data={filteredIngredients}
            columns={[
              {
                header: 'Ingredient',
                accessor: (ing) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Coffee size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{ing.name}</p>
                      <p className="text-xs text-slate-500">{ing.unit}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: (ing) => (
                   <Badge variant={(ing as any).is_active !== false ? 'success' : 'neutral'}>
                     {(ing as any).is_active !== false ? 'Active' : 'Inactive'}
                   </Badge>
                 )
              },
              {
                header: 'Actions',
                accessor: (ing) => (
                  <div className="flex items-center gap-2">
                    {canUpdate('ingredients') && (
                      <button
                        onClick={() => openModal(ing)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canDelete('ingredients') && (
                      <button
                        onClick={() => handleDelete(ing.id || ing._id!)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
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
        title={editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingIngredient ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Ingredient Name"
            placeholder="e.g., Coffee Beans, Fresh Milk"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit"
              placeholder="e.g., kg, liters, pieces"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
            <Input
              label="Cost per Unit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost_per_unit || ""}
              onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <Input
            label="SKU"
            placeholder="e.g., COFFEE-BEANS-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IngredientsListView;
