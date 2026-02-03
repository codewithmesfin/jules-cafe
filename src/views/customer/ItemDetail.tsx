"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Star, Clock } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import type { MenuItem } from '../../types';

const ItemDetail: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToCart } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await api.public.menuItems.getOne(id);
        // API returns data in standard format with id transformation
        setItem(data?.data || data);
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading item...</div>;

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Item not found</h1>
        <Button onClick={() => router.push('/menu')}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2" size={20} /> Back to Menu
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] md:h-[600px]">
          <img
            src={item.image_url || undefined}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="info">{(item.category_id as any)?.name || 'Category'}</Badge>
            {!item.is_active && <Badge variant="error">Out of Stock</Badge>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.name}</h1>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center text-orange-400">
              <Star size={18} fill="currentColor" />
              <span className="ml-1 text-gray-900 font-bold">4.9</span>
              <span className="ml-1 text-gray-500 text-sm">(48 reviews)</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={18} className="mr-1" /> 15-20 min
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {item.description}
          </p>
          <div className="text-3xl font-bold text-[#e60023] mb-8">
            ETB {item.base_price.toFixed(2)}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 text-lg"
              disabled={!item.is_active}
              onClick={() => {
                for (let i = 0; i < quantity; i++) addToCart(item);
                router.push('/cart');
              }}
            >
              Add to Cart - ETB {(item.base_price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
