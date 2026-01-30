import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_BRANCH_MENU_ITEMS, MOCK_CATEGORIES } from '../../utils/mockData';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const MenuAvailability: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Get items and their availability for this branch
  const branchItems = MOCK_MENU_ITEMS.map(item => {
    const branchInfo = MOCK_BRANCH_MENU_ITEMS.find(
      bm => bm.menu_item_id === item.id && bm.branch_id === user?.branch_id
    );
    return {
      ...item,
      is_available: branchInfo ? branchInfo.is_available : false
    };
  }).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        data={branchItems}
        columns={[
          {
            header: 'Item',
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{MOCK_CATEGORIES.find(c => c.id === item.category_id)?.name}</p>
                </div>
              </div>
            )
          },
          { header: 'Base Price', accessor: (item) => `$${item.base_price.toFixed(2)}` },
          {
            header: 'Status',
            accessor: (item) => (
              <Badge variant={item.is_available ? 'success' : 'error'}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            )
          },
          {
            header: 'Toggle Availability',
            accessor: (item) => (
              <Button
                variant={item.is_available ? 'outline' : 'primary'}
                size="sm"
                className="gap-2"
              >
                {item.is_available ? (
                  <>
                    <XCircle size={16} /> Mark Unavailable
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Mark Available
                  </>
                )}
              </Button>
            )
          }
        ]}
      />
    </div>
  );
};

export default MenuAvailability;
