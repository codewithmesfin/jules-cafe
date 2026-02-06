"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ChefHat, ArrowLeft, Loader2, Plus, ShoppingCart, Star } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (slug) {
      fetchBusinessData();
    }
  }, [slug]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Fetch business info
      const businessRes = await fetch(`${API_URL}/public/business/${slug}`);
      const businessData = await businessRes.json();
      
      if (!businessData.success) {
        setError('Business not found');
        setLoading(false);
        return;
      }
      
      setBusiness(businessData.data);

      // Fetch categories
      const categoriesRes = await fetch(`${API_URL}/public/categories?business_id=${businessData.data._id}`);
      const categoriesData = await categoriesRes.json();
      
      if (categoriesData.success) {
        setCategories(categoriesData.data);
        if (categoriesData.data.length > 0) {
          setSelectedCategory(categoriesData.data[0]._id);
        }
      }

      // Fetch products
      const productsRes = await fetch(`${API_URL}/public/products?business_id=${businessData.data._id}`);
      const productsData = await productsRes.json();
      
      if (productsData.success) {
        setProducts(productsData.data);
      }
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-rose-500 mb-4">{error || 'Business not found'}</p>
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl"
          >
            <ArrowLeft size={18} />
            Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Business Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>All Businesses</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <ChefHat size={24} />
                </div>
                <h1 className="text-2xl font-bold">{business.name}</h1>
              </div>
              
              {business.description && (
                <p className="text-slate-300 mt-2 max-w-xl">{business.description}</p>
              )}
              
              {business.address && (
                <p className="text-slate-400 text-sm mt-2 flex items-center gap-1">
                  <span>📍</span>
                  {business.address}
                </p>
              )}
            </div>
            
            {/* Rating Badge */}
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <div className="w-64 flex-shrink-0">
            <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedCategory === category._id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-slate-500 text-sm">No categories available</p>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-4">
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name
                : 'All Items'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{product.name}</h4>
                      {product.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="font-semibold text-slate-900 mt-2">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.is_available}
                      className={`ml-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        product.is_available
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  {!product.is_available && (
                    <p className="text-xs text-rose-500 mt-2">Currently unavailable</p>
                  )}
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <p className="text-slate-500 text-center py-8">No products in this category</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 hover:bg-slate-800 transition-all">
            <ShoppingCart size={20} />
            <span className="font-medium">{cartCount} items</span>
            <span className="w-px h-5 bg-slate-700"></span>
            <span className="font-semibold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
