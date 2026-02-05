"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, Grid3X3, Folder, FolderX } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Card } from '../../components/ui/Card';
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
      const catData = Array.isArray(data) ? data : (data?.data || []);
      setCategories(catData);
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

  // Stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const inactiveCategories = categories.filter(c => !c.is_active).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Organize your products into categories</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center">
              <Grid3X3 size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Categories</p>
              <p className="text-xl font-bold text-gray-900">{totalCategories}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Folder size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active</p>
              <p className="text-xl font-bold text-emerald-600">{activeCategories}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center">
              <FolderX size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Inactive</p>
              <p className="text-xl font-bold text-gray-400">{inactiveCategories}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {canCreate('categories') && (
            <Button onClick={() => openModal()}>
              <Plus size={18} className="mr-1" /> Add Category
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
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 className="mx-auto h-10 w-10 text-gray-200 mb-3" />
            <p className="text-gray-500">No categories found</p>
            {canCreate('categories') && (
              <Button variant="outline" className="mt-3" onClick={() => openModal()}>
                Add first category
              </Button>
            )}
          </div>
        ) : (
          <Table
            data={filteredCategories}
            columns={[
              {
                header: 'Name',
                accessor: (cat) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Grid3X3 size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</p>
                      )}
                    </div>
                  </div>
                )
              },
              {
                header: 'Status',
                accessor: (cat) => (
                  <Badge variant={cat.is_active ? 'success' : 'neutral'} size="sm">
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                )
              },
              {
                header: 'Actions',
                accessor: (cat) => (
                  <div className="flex items-center gap-2">
                    {canUpdate('categories') && (
                      <button
                        onClick={() => openModal(cat)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canDelete('categories') && (
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
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
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Category Name"
            placeholder="e.g. Beverages"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
              placeholder="Describe this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active and visible
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Categories;
