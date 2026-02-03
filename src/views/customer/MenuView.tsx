"use client"

import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Info, ShoppingCart, Grid, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import { cn } from '../../utils/cn';
import type { Product, Category, Business } from '../../types';

interface MenuViewProps {
  companyId: string; // This is the tenant_id from URL (ID or Slug)
}

const MenuView: React.FC<MenuViewProps> = ({ companyId }) => {
  const searchParams = useSearchParams();
  const urlTableId = searchParams.get('tableId');
  const urlTableNo = searchParams.get('tableNo');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, setTableId, setTableNo, tableNo } = useCart();

  useEffect(() => {
    if (urlTableId) setTableId(urlTableId);
    if (urlTableNo) setTableNo(urlTableNo);
  }, [urlTableId, urlTableNo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Resolve business info first
        const bizRes = await api.public.getBusiness(companyId);
        const bizData = bizRes.data || bizRes;
        setBusiness(bizData);

        const bizId = bizData.id || bizData._id;

        // 2. Fetch products and categories for this business
        const [prodRes, catRes] = await Promise.all([
          api.public.getProducts(bizId),
          api.public.getCategories(bizId),
        ]);

        setProducts(prodRes.data || prodRes);
        setCategories(catRes.data || catRes);
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  const filteredItems = products.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory || (item.category_id as any)?._id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && item.is_active;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Preparing the Menu...</p>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-sm">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Business Not Found</h1>
        <p className="text-slate-500 font-medium mb-6">The link you followed may be incorrect or the business is currently unavailable.</p>
        <Button className="w-full rounded-2xl" onClick={() => window.location.href = '/'}>Return Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Premium Hero Banner */}
      <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
        {business.banner ? (
          <img src={business.banner} className="w-full h-full object-cover opacity-60" alt="Banner" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-80" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20">
          <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-2xl mb-4 overflow-hidden">
            {business.logo ? (
              <img src={business.logo} className="w-full h-full object-contain rounded-2xl" alt="Logo" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black rounded-2xl">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">{business.name}</h1>
          <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mt-2">{business.address || 'Premium Dining Experience'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        {/* Table Notification */}
        {tableNo && (
          <div className="mb-6 p-4 bg-white/80 backdrop-blur-md border border-white rounded-2xl flex items-center gap-3 text-slate-900 shadow-xl shadow-slate-200/50">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Grid size={20} />
            </div>
            <p className="font-black">Direct Ordering Active: <span className="text-blue-600">Table {tableNo}</span></p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-8 border border-white">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input
              placeholder="What are you craving today? Search our menu..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Scroll */}
        <div className="flex overflow-x-auto pb-4 gap-3 mb-8 no-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "whitespace-nowrap px-8 py-3 rounded-2xl text-sm font-black transition-all border shrink-0",
              selectedCategory === 'all'
                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                : "bg-white border-slate-100 text-slate-500 hover:border-blue-100 hover:bg-blue-50"
            )}
          >
            Full Menu
          </button>
          {categories.map(category => (
            <button
              key={category.id || (category as any)._id}
              onClick={() => setSelectedCategory((category.id || (category as any)._id)!)}
              className={cn(
                "whitespace-nowrap px-8 py-3 rounded-2xl text-sm font-black transition-all border shrink-0",
                selectedCategory === (category.id || (category as any)._id)
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                  : "bg-white border-slate-100 text-slate-500 hover:border-blue-100 hover:bg-blue-50"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id || item._id}
                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Grid size={64} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                      <Plus size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">{item.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 h-10">{item.description}</p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-2xl font-black text-slate-900">${item.price.toFixed(2)}</span>
                    <Button
                      onClick={() => addToCart({
                        id: item.id || item._id,
                        name: item.name,
                        price: item.price,
                        image_url: item.image_url,
                        description: item.description,
                        category_id: (item.category_id as any)?._id || item.category_id
                      } as any)}
                      className="rounded-xl h-12 px-6 font-black"
                    >
                      Add To Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-200 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No delicacies found</h3>
            <p className="text-slate-500 font-medium">Try broadening your search or exploring another category.</p>
          </div>
        )}
      </div>

      {/* Floating Cart for Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md lg:hidden">
        <Link href={`/${companyId}/cart`}>
          <button className="w-full bg-slate-900 text-white h-16 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-blue-900/40 active:scale-95 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">View Your Order</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight size={20} className="text-slate-400" />
            </div>
          </button>
        </Link>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// Helper for Link fallback since I don't want to import Link if it might cause issues in this context
// But MenuView is usually inside a Next.js app so it's fine.
import Link from 'next/link';

export default MenuView;
