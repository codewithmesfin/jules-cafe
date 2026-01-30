import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Search, Grid } from 'lucide-react';
import { MOCK_MENU_ITEMS, MOCK_CATEGORIES, MOCK_TABLES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { MenuItem } from '../../types';

interface CartItem extends MenuItem {
  quantity: number;
}

const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState('');

  const filteredItems = MOCK_MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.base_price * item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Menu Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
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

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              className="p-3 cursor-pointer hover:border-orange-500 transition-colors flex flex-col"
              onClick={() => addToCart(item)}
            >
              <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-bold text-orange-600">${item.base_price.toFixed(2)}</span>
                <Button size="sm" variant="outline"><Plus size={14} /></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <Card className="w-96 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <ShoppingCart size={20} className="text-orange-600" />
          <h3 className="font-bold text-gray-900">Current Order</h3>
        </div>

        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <Grid size={16} className="text-gray-400" />
            <select
              className="flex-1 text-sm border-none bg-transparent focus:ring-0"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              <option value="">Select Table (Optional)</option>
              {MOCK_TABLES.filter(t => t.branch_id === user?.branch_id).map(t => (
                <option key={t.id} value={t.id}>Table {t.table_number} ({t.capacity} seats)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Cart is empty.</p>
              <p className="text-xs">Click items to add to order.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-orange-600 font-medium">${item.base_price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg" disabled={cart.length === 0}>
            Place Order
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NewOrder;
