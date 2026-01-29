import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_CATEGORIES, MOCK_VARIANTS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const MenuItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = MOCK_MENU_ITEMS.filter(item => {
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
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
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
          {
            header: 'Base Price',
            accessor: (item) => `$${item.base_price.toFixed(2)}`
          },
          {
            header: 'Variants',
            accessor: (item) => {
              const variants = MOCK_VARIANTS.filter(v => v.menu_item_id === item.id);
              return variants.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {variants.map(v => (
                    <Badge key={v.id} variant="neutral" className="text-[10px] py-0 px-1">
                      {v.name} (+${v.price_modifier})
                    </Badge>
                  ))}
                </div>
              ) : <span className="text-gray-400 text-xs">None</span>;
            }
          },
          {
            header: 'Availability',
            accessor: (item) => (
              <Badge variant={item.is_active ? 'success' : 'error'}>
                {item.is_active ? 'In Stock' : 'Out of Stock'}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: () => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                <Button variant="ghost" size="sm" className="text-red-600"><Trash2 size={16} /></Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Menu Item"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create Item</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Item Name" placeholder="e.g. Pasta Carbonara" />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {MOCK_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input label="Base Price" type="number" step="0.01" placeholder="0.00" />
          <Input label="Image URL" placeholder="https://..." />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]" />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Variants</label>
              <Button size="sm" variant="outline" className="gap-1"><Plus size={12} /> Add Variant</Button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input placeholder="Variant Name (e.g. Large)" className="flex-1" />
                <Input placeholder="Price Modifier" type="number" className="w-32" />
                <Button variant="ghost" size="sm" className="text-red-500"><Trash2 size={16} /></Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;
