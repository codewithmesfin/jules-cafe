import React, { useState } from 'react';
import { Search, Plus, Edit, AlertTriangle } from 'lucide-react';
import { MOCK_INGREDIENTS, MOCK_STOCK } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inventoryData = MOCK_STOCK.map(stock => {
    const ingredient = MOCK_INGREDIENTS.find(i => i.id === stock.ingredient_id);
    return {
      ...stock,
      ingredientName: ingredient?.name || 'Unknown',
      unit: ingredient?.unit || '',
    };
  }).filter(item =>
    item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ingredients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Ingredient
        </Button>
      </div>

      <Table
        data={inventoryData}
        columns={[
          {
            header: 'Ingredient',
            accessor: (item) => (
              <span className="font-bold text-gray-900">{item.ingredientName}</span>
            )
          },
          {
            header: 'Stock Level',
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <span>{item.quantity} {item.unit}</span>
                {item.quantity <= item.min_stock_level && (
                  <AlertTriangle size={16} className="text-orange-500" />
                )}
              </div>
            )
          },
          { header: 'Min Level', accessor: (item) => `${item.min_stock_level} ${item.unit}` },
          {
            header: 'Status',
            accessor: (item) => (
              <Badge variant={item.quantity > item.min_stock_level ? 'success' : 'warning'}>
                {item.quantity > item.min_stock_level ? 'In Stock' : 'Low Stock'}
              </Badge>
            )
          },
          { header: 'Last Updated', accessor: (item) => new Date(item.updated_at).toLocaleDateString() },
          {
            header: 'Actions',
            accessor: () => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Edit size={16} /></Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Ingredient"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Add Ingredient</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Ingredient Name" placeholder="e.g. Flour" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Initial Quantity" type="number" defaultValue="0" />
            <Input label="Unit" placeholder="e.g. kg, pcs, liter" />
          </div>
          <Input label="Minimum Stock Level" type="number" defaultValue="5" />
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
