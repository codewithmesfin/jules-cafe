"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Coffee, Edit, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, MobileTableCard } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../utils/cn';
import type { Ingredient } from '../../types';

interface Unit {
  id: string;
  _id: string;
  name: string;
}

const IngredientsListView: React.FC = () => {
  const { showNotification } = useNotification();
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit_id: '',
    unit_name: '',
    cost_per_unit: 0,
    sku: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, unitsRes] = await Promise.all([
        api.ingredients.getAll(),
        api.settings.getUnits()
      ]);
      setIngredients(Array.isArray(ingRes) ? ingRes : ingRes.data || []);
      setUnits(Array.isArray(unitsRes) ? unitsRes : unitsRes.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.name || !formData.unit_id) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        unit_id: formData.unit_id,
        cost_per_unit: formData.cost_per_unit,
        sku: formData.sku,
        is_active: formData.is_active
      };

      if (editingIngredient) {
        await api.ingredients.update(editingIngredient.id || editingIngredient._id!, payload);
        showNotification('Ingredient updated successfully');
      } else {
        await api.ingredients.create(payload);
        showNotification('Ingredient created successfully');
      }
      setIsModalOpen(false);
      setEditingIngredient(null);
      setFormData({ name: '', unit_id: '', unit_name: '', cost_per_unit: 0, sku: '', is_active: true });
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
      // Find the unit from the populated unit_id or from units list
      let unitId = '';
      let unitName = '';
      if ((ingredient as any).unit_id) {
        if (typeof (ingredient as any).unit_id === 'object') {
          unitId = (ingredient as any).unit_id._id || (ingredient as any).unit_id.id;
          unitName = (ingredient as any).unit_id.name;
        } else {
          unitId = (ingredient as any).unit_id;
          const foundUnit = units.find(u => u.id === unitId || u._id === unitId);
          unitName = foundUnit?.name || '';
        }
      }
      setFormData({
        name: ingredient.name,
        unit_id: unitId,
        unit_name: unitName,
        cost_per_unit: (ingredient as any).cost_per_unit || 0,
        sku: (ingredient as any).sku || '',
        is_active: (ingredient as any).is_active !== false
      });
    } else {
      setEditingIngredient(null);
      setFormData({ name: '', unit_id: '', unit_name: '', cost_per_unit: 0, sku: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((ing as any).unit_name || (ing as any).unit || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Ingredient',
      accessor: (ing: Ingredient) => {
        const unitName = (ing as any).unit_name || (ing as any).unit || '';
        return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Coffee size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{ing.name}</p>
            <p className="text-xs text-slate-500">{unitName}</p>
          </div>
        </div>
      )}
    },
    {
      header: 'Status',
      accessor: (ing: Ingredient) => (
        <Badge variant={(ing as any).is_active !== false ? 'success' : 'neutral'} size="sm">
          {(ing as any).is_active !== false ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (ing: Ingredient) => (
        <div className="flex items-center gap-2">
          {canUpdate('ingredients') && (
            <button
              onClick={() => openModal(ing)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Edit size={16} />
            </button>
          )}
          {canDelete('ingredients') && (
            <button
              onClick={() => handleDelete(ing.id || ing._id!)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ingredients</h1>
          <p className="text-slate-500 text-sm">Manage your ingredient catalog</p>
        </div>
        {canCreate('ingredients') && (
          <Button onClick={() => openModal()}>
            <Plus size={18} className="mr-2" /> Add Ingredient
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search ingredients..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          data={filteredIngredients}
          columns={columns}
          loading={loading}
          emptyMessage="No ingredients found"
        />
      </div>

      {/* Mobile Card View */}
      <MobileTableCard
        data={filteredIngredients}
        columns={columns}
        loading={loading}
        emptyMessage="No ingredients found"
        renderCard={(ing) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Coffee size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{ing.name}</p>
                <p className="text-sm text-slate-500">{formData.unit_name || (ing as any).unit_name || (ing as any).unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={(ing as any).is_active !== false ? 'success' : 'neutral'} size="sm">
                {(ing as any).is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
              {canUpdate('ingredients') && (
                <button
                  onClick={() => openModal(ing)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              {editingIngredient ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Ingredient Name"
            placeholder="e.g., Coffee Beans, Fresh Milk"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={formData.unit_id}
                onChange={(e) => {
                  const selectedUnit = units.find(u => u.id === e.target.value || u._id === e.target.value);
                  setFormData({ ...formData, unit_id: e.target.value, unit_name: selectedUnit?.name || '' });
                }}
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit.id || unit._id} value={unit.id || unit._id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Cost per Unit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost_per_unit || ''}
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
              id="ing_is_active"
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="ing_is_active" className="text-sm font-medium text-slate-700">
              Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IngredientsListView;
