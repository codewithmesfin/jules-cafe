"use client"

import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import type { MenuItem, MenuCategory, Branch, BranchMenuItem } from '../../types';

interface MenuViewProps {
  companyId?: string;
}

const MenuView: React.FC<MenuViewProps> = ({ companyId }) => {
  const searchParams = useSearchParams();
  const urlBranchId = searchParams.get('branchId');
  const urlTableId = searchParams.get('tableId');
  const urlTableNo = searchParams.get('tableNo');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchMenuItems, setBranchMenuItems] = useState<BranchMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, setBranchId, setTableId, setTableNo, tableNo } = useCart();

  // Simple cache for API responses (1 minute cache) - includes version to invalidate old cache
  const cacheKey = `menu_cache_v2_${companyId}`;
  const getCachedData = (key: string) => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data[key] && Date.now() - data[key].timestamp < 60000) {
          return data[key].value;
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  };

  const setCachedData = (key: string, value: any) => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      const data = cached ? JSON.parse(cached) : {};
      data[key] = { value, timestamp: Date.now() };
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      // Ignore errors
    }
  };

  useEffect(() => {
    if (urlBranchId) {
      setSelectedBranchId(urlBranchId);
      setBranchId(urlBranchId);
    }
    if (urlTableId) {
      setTableId(urlTableId);
    }
    if (urlTableNo) {
      setTableNo(urlTableNo);
    }
  }, [urlBranchId, urlTableId, urlTableNo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedItems = getCachedData('items');
        const cachedCats = getCachedData('categories');
        const cachedBranches = getCachedData('branches');
        const cachedBmItems = getCachedData('bmItems');
        
        if (cachedItems && cachedCats && cachedBranches && cachedBmItems) {
          setMenuItems(cachedItems);
          setCategories(cachedCats);
          setBranches(cachedBranches);
          setBranchMenuItems(cachedBmItems);
          setLoading(false);
          return;
        }
        
        const [items, cats, brnchs, bmItems] = await Promise.all([
          api.public.menuItems.getAll(companyId),
          api.public.categories.getAll(companyId),
          api.public.branches.getAll(companyId),
          api.public.branchMenuItems.getAll(companyId),
        ]);
        
        const itemsData = items?.data || items;
        const catsData = cats?.data || cats;
        const brnchsData = brnchs?.data || brnchs;
        const bmItemsData = bmItems?.data || bmItems;
        
        // Cache the responses
        setCachedData('items', itemsData);
        setCachedData('categories', catsData);
        setCachedData('branches', brnchsData);
        setCachedData('bmItems', bmItemsData);
        
        setMenuItems(itemsData);
        setCategories(catsData);
        setBranches(brnchsData);
        setBranchMenuItems(bmItemsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  const filteredItems = menuItems.map(item => {
    // If a branch is selected, find the override for availability
    let isAvailable = item.is_active;
    let belongsToBranch = false;
    if (selectedBranchId !== 'all') {
      // Check BranchMenuItem record first
      const branchInfo = branchMenuItems.find(bm => 
        bm.branch_id === selectedBranchId && bm.menu_item_id === item.id
      );
      
      // Also check if menu item has branch_id set directly
      const hasDirectBranchId = item.branch_id === selectedBranchId;
      
      if (branchInfo || hasDirectBranchId) {
        belongsToBranch = true;
        if (branchInfo) {
          isAvailable = item.is_active && branchInfo.is_available;
        } else {
          isAvailable = item.is_available ?? item.is_active;
        }
      }
    } else {
      // When "All Branches" is selected, show all company items
      belongsToBranch = true;
    }

    return {
      ...item,
      computed_available: isAvailable,
      belongs_to_branch: belongsToBranch
    };
  }).filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Only show active items
    const isActive = item.is_active;
    // If branch is selected, only show items that belong to that branch
    const matchesBranch = selectedBranchId === 'all' || item.belongs_to_branch;
    return matchesCategory && matchesSearch && isActive && matchesBranch;
  });

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="container mx-auto px-4 py-8">
      {tableNo && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-800">
          <Info className="text-[#e60023]" size={20} />
          <p className="font-bold">Ordering for Table {tableNo} {selectedBranch && `at ${selectedBranch.branch_name}`}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">Choose from our wide variety of delicious dishes.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] appearance-none"
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setBranchId(e.target.value === 'all' ? null : e.target.value);
              }}
              disabled={!!urlBranchId}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name || branch.branch_name}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className="whitespace-nowrap rounded-full"
        >
          All Items
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap rounded-full"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading menu...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}
                {!item.computed_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="error" className="text-sm px-3 py-1">Not available</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="text-[#e60023] font-bold">ETB {item.base_price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.description}</p>
                <Button
                  onClick={() => addToCart(item)}
                  disabled={!item.computed_available}
                  className="w-full gap-2"
                  size="sm"
                >
                  <Plus size={18} /> Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default MenuView;
