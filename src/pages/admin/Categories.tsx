import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import type { MenuCategory } from '../../types';

const Categories: React.FC = () => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<MenuCategory[]>(MOCK_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && cat.is_active) ||
                         (statusFilter === 'inactive' && !cat.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingCategory(null);
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add Category
        </Button>
      </div>

      <Table
        data={filteredCategories}
        columns={[
          { header: 'Name', accessor: 'name', className: 'font-bold text-gray-900' },
          { header: 'Description', accessor: 'description', className: 'max-w-xs truncate' },
          {
            header: 'Status',
            accessor: (cat) => (
              <Badge variant={cat.is_active ? 'success' : 'neutral'}>
                {cat.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          { header: 'Created At', accessor: (cat) => new Date(cat.created_at).toLocaleDateString() },
          {
            header: 'Actions',
            accessor: (cat) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(cat);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setCategoryToDelete(cat)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingCategory(null);
            }}>Cancel</Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              if (editingCategory) {
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: editingCategory.name } : c));
                showNotification("Category updated successfully");
              } else {
                showNotification("Category created successfully");
              }
              setEditingCategory(null);
            }}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Desserts" defaultValue={editingCategory?.name} />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              defaultValue={editingCategory?.description}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="rounded text-orange-600 focus:ring-orange-500"
              defaultChecked={editingCategory ? editingCategory.is_active : true}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
            showNotification("Category deleted successfully", "warning");
          }
          setCategoryToDelete(null);
        }}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Categories;
