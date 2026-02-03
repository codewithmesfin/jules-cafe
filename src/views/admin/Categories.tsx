"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../utils/cn';
import type { Category } from '../../types';

const Categories: React.FC = () => {
  const { showNotification } = useNotification();
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      showNotification("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && cat.is_active) ||
                         (statusFilter === 'inactive' && !cat.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("Category name is required", "error");
      return;
    }

    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, formData);
        showNotification("Category updated successfully");
      } else {
        await api.categories.create(formData);
        showNotification("Category created successfully");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      showNotification("Failed to save category", "error");
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await api.categories.delete(categoryToDelete.id);
        showNotification("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        showNotification("Failed to delete category", "error");
      } finally {
        setCategoryToDelete(null);
      }
    }
  };

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="pl-10 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[160px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        {canCreate('categories') && (
          <Button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Category
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No categories found</h3>
            <p className="text-slate-500">Add categories to organize your products.</p>
          </div>
        ) : (
          <Table
            data={filteredCategories}
            columns={[
              {
                header: 'Name',
                accessor: (cat) => <span className="font-bold text-slate-900">{cat.name}</span>
              },
              {
                header: 'Description',
                accessor: (cat) => <span className="text-slate-500 text-sm">{cat.description || "—"}</span>
              },
              {
                header: 'Status',
                accessor: (cat) => (
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", cat.is_active ? "bg-green-500" : "bg-slate-300")} />
                    <span className={cn("text-xs font-bold uppercase tracking-wider", cat.is_active ? "text-green-600" : "text-slate-400")}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                )
              },
              {
                header: 'Actions',
                accessor: (cat) => (
                  <div className="flex items-center gap-2">
                    {canUpdate('categories') && (
                      <button
                        onClick={() => openModal(cat)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canDelete('categories') && (
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )
              }
            ]}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
        className="max-w-xl"
      >
        <div className="space-y-6 pt-4">
          <Input
            label="Category Name"
            placeholder="e.g. Beverages"
            className="rounded-2xl"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px]"
              placeholder="Describe what's in this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-bold text-slate-700">Active and visible</label>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl py-4 font-bold">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 rounded-2xl py-4 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? Items in this category might become uncategorized.`}
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  );
};

export default Categories;
