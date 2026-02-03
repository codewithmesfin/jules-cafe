"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '../../hooks/usePermission';

const MenuAvailability: React.FC = () => {
  const { currentBusiness } = useAuth();
  const { showNotification } = useNotification();
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [formData, setFormData] = useState({ product_id: '', is_available: true, display_order: 0, available_from: '', available_to: '' });

  useEffect(() => { 
    fetchData(); 
  }, [currentBusiness]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching menu items...');
      const menuRes = await api.menu.getAll();
      console.log('Menu response:', menuRes);
      setMenuItems(Array.isArray(menuRes) ? menuRes : []);
      
      console.log('Fetching products...');
      const prodRes = await api.products.getAll();
      console.log('Products response:', prodRes);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes.data || []));
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification('Failed to load menu data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.product_id) {
      showNotification('Please select a product', 'error');
      return;
    }

    try {
      if (editingMenu) {
        await api.menu.update(editingMenu.id, formData);
        showNotification('Menu item updated');
      } else {
        await api.menu.create(formData);
        showNotification('Menu item added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) { 
      showNotification(error.message || 'Error saving menu item', 'error'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this menu item?')) {
      try {
        await api.menu.delete(id);
        showNotification('Menu item removed', 'warning');
        fetchData();
      } catch (error: any) {
        showNotification(error.message || 'Error deleting', 'error');
      }
    }
  };

  const filteredMenu = menuItems.filter(m => {
    const prodId = m.product_id?.id || m.product_id;
    const prod = products.find(p => p.id === prodId);
    const prodName = prod?.name?.toLowerCase() || '';
    return prodName.includes(searchTerm.toLowerCase());
  });

  console.log('Filtered menu items:', filteredMenu.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500">Manage your public menu items</p>
        </div>
        {canCreate('menu') && (
          <Button onClick={() => {
            setEditingMenu(null);
            setFormData({ product_id: '', is_available: true, display_order: 0, available_from: '', available_to: '' });
            setIsModalOpen(true);
          }}>
            <Plus size={18} className="mr-2" /> Add Menu Item
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search menu items..."
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
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-500">No menu items found</p>
            {canCreate('menu') && (
              <Button variant="outline" className="mt-3" onClick={() => setIsModalOpen(true)}>
                Add your first menu item
              </Button>
            )}
          </div>
        ) : (
          <Table
            data={filteredMenu}
            columns={[
              {
                header: 'Product',
                accessor: (m) => {
                  const prodId = m.product_id?.id || m.product_id;
                  const prod = products.find(p => p.id === prodId);
                  return (
                    <div>
                      <p className="font-medium text-slate-900">{prod?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{prod?.description || ''}</p>
                    </div>
                  );
                }
              },
              {
                header: 'Status',
                accessor: (m) => (
                  <Badge variant={m.is_available ? 'success' : 'neutral'}>
                    {m.is_available ? 'Live' : 'Hidden'}
                  </Badge>
                )
              },
              {
                header: 'Order',
                accessor: (m) => <span className="text-slate-500">{m.display_order}</span>
              },
              {
                header: 'Hours',
                accessor: (m) => (
                  <span className="text-slate-500 text-sm">
                    {m.available_from && m.available_to 
                      ? `${m.available_from} - ${m.available_to}` 
                      : 'All day'}
                  </span>
                )
              },
              {
                header: 'Actions',
                accessor: (m) => (
                  <div className="flex items-center gap-2">
                    {canUpdate('menu') && (
                      <button
                        onClick={() => {
                          setEditingMenu(m);
                          setFormData({
                            product_id: m.product_id?.id || m.product_id,
                            is_available: m.is_available,
                            display_order: m.display_order,
                            available_from: m.available_from || '',
                            available_to: m.available_to || ''
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canDelete('menu') && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600"
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
        title={editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingMenu ? 'Update' : 'Add'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {!editingMenu && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Display Order"
            type="number"
            min="0"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Available From"
              type="time"
              value={formData.available_from}
              onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
            />
            <Input
              label="Available To"
              type="time"
              value={formData.available_to}
              onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700">
              Available on menu
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuAvailability;
