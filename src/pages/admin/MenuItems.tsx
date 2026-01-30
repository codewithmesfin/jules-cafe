import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_CATEGORIES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import type { MenuItem } from '../../types';

const MenuItems: React.FC = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {MOCK_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add Item
        </Button>
      </div>

      <Table
        data={filteredItems}
        columns={[
          {
            header: 'Item',
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <span className="font-bold text-gray-900">{item.name}</span>
              </div>
            )
          },
          {
            header: 'Category',
            accessor: (item) => MOCK_CATEGORIES.find(c => c.id === item.category_id)?.name || 'N/A'
          },
          { header: 'Base Price', accessor: (item) => `$${item.base_price.toFixed(2)}` },
          {
            header: 'Status',
            accessor: (item) => (
              <Badge variant={item.is_active ? 'success' : 'neutral'}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setItemToDelete(item)}
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
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}>Cancel</Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              if (editingItem) {
                setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, name: editingItem.name } : i));
                showNotification("Item updated successfully");
              } else {
                showNotification("Item created successfully");
              }
              setEditingItem(null);
            }}>
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Item Name" placeholder="e.g. Pasta Carbonara" defaultValue={editingItem?.name} />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              defaultValue={editingItem?.category_id}
            >
              {MOCK_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input label="Price" type="number" step="0.01" placeholder="0.00" defaultValue={editingItem?.base_price} />
          <Input label="Image URL" placeholder="https://..." defaultValue={editingItem?.image_url} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              defaultValue={editingItem?.description}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="rounded text-orange-600 focus:ring-orange-500"
              defaultChecked={editingItem ? editingItem.is_active : true}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            showNotification("Item deleted successfully", "warning");
          }
          setItemToDelete(null);
        }}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default MenuItems;
