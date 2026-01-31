import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import { formatImageUrl } from '../../utils/format';
import type { MenuItem, MenuCategory } from '../../types';

const MenuView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, cats] = await Promise.all([
          api.menuItems.getAll(),
          api.categories.getAll(),
        ]);
        setMenuItems(items);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">Choose from our wide variety of delicious dishes.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
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
              <div className="relative h-48 overflow-hidden">
                <img
                  src={formatImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!item.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="error" className="text-sm px-3 py-1">Sold Out</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="text-orange-600 font-bold">${item.base_price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.description}</p>
                <Button
                  onClick={() => addToCart(item)}
                  disabled={!item.is_active}
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
