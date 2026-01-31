"use client";
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { MenuItem, MenuCategory, BranchMenuItem } from '../../types';

const MenuAvailability: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [branchMenuItems, setBranchMenuItems] = useState<BranchMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.branch_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [items, cats, bmItems] = await Promise.all([
        api.menuItems.getAll(),
        api.categories.getAll(),
        api.branchMenuItems.getAll(),
      ]);
      setMenuItems(items);
      setCategories(cats);
      setBranchMenuItems(bmItems.filter((bm: BranchMenuItem) => {
        const bId = typeof bm.branch_id === 'string' ? bm.branch_id : (bm.branch_id as any)?.id;
        const userBId = typeof user?.branch_id === "string" ? user?.branch_id : (user?.branch_id as any)?.id;
        return bId === userBId;
      }));
    } catch (error) {
      console.error('Failed to fetch menu availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: MenuItem, currentAvailability: boolean) => {
    try {
      const bmItem = branchMenuItems.find(bm => {
        const mId = typeof bm.menu_item_id === 'string' ? bm.menu_item_id : (bm.menu_item_id as any)?.id;
        return mId === item.id;
      });
      if (bmItem) {
        await api.branchMenuItems.update(bmItem.id, { is_available: !currentAvailability });
      } else {
        await api.branchMenuItems.create({
          branch_id: user?.branch_id,
          menu_item_id: item.id,
          is_available: !currentAvailability
        });
      }
      showNotification(`Updated availability for ${item.name}`);
      fetchData();
    } catch (error) {
      showNotification('Failed to update availability', 'error');
    }
  };

  const branchItems = menuItems.map(item => {
    const branchInfo = branchMenuItems.find(bm => {
      const mId = typeof bm.menu_item_id === 'string' ? bm.menu_item_id : (bm.menu_item_id as any)?.id;
      return mId === item.id;
    });
    return {
      ...item,
      is_available: branchInfo ? branchInfo.is_available : true // Default to available if no record
    };
  }).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage menu availability.
        </p>
      </div>
    );
  }

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

      {loading ? (
        <div className="text-center py-10">Loading menu...</div>
      ) : (
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
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const catId = typeof item.category_id === 'string' ? item.category_id : (item.category_id as any)?.id;
                        return categories.find(c => c.id === catId)?.name || 'N/A';
                      })()}
                    </p>
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
                  onClick={() => handleToggle(item, item.is_available)}
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
      )}
    </div>
  );
};

export default MenuAvailability;
