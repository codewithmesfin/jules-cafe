"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2, Star, MapPin, Clock, Filter } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  description: string;
  address: string;
  logo?: string;
  banner?: string;
}

interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export default function BusinessMenuPage() {
  const params = useParams();
  const id = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const businessRes = await fetch(`${API_URL}/public/business/${id}`);
      const businessData = await businessRes.json();
      
      if (!businessData.success) {
        setError('Business not found');
        setLoading(false);
        return;
      }
      
      setBusiness(businessData.data);

      const menuRes = await fetch(`${API_URL}/public/menu?business_id=${id}`);
      const menuData = await menuRes.json();
      
      if (menuData.success) {
        setCategories(menuData.data.categories);
        if (menuData.data.categories.length > 0) {
          setSelectedCategory(menuData.data.categories[0]._id);
        }
      }
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  function getCategoryEmoji(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('coffee') || lowerName.includes('drink')) return '☕';
    if (lowerName.includes('food') || lowerName.includes('main')) return '🍽️';
    if (lowerName.includes('breakfast')) return '🍳';
    if (lowerName.includes('lunch')) return '🥗';
    if (lowerName.includes('dinner')) return '🍲';
    if (lowerName.includes('dessert') || lowerName.includes('sweet')) return '🍰';
    if (lowerName.includes('snack') || lowerName.includes('appetizer')) return '🍟';
    if (lowerName.includes('beverage') || lowerName.includes('juice')) return '🧃';
    if (lowerName.includes('tea')) return '🍵';
    return '📋';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error || 'Business not found'}</p>
          <Link
            href="/businesses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Banner with Overlay */}
      <div className="relative h-56 md:h-72 lg:h-80 bg-gray-900 overflow-hidden">
        {business.banner ? (
          <img
            src={business.banner}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Back Button */}
        <Link
          href="/businesses"
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-700 hover:bg-white transition-all shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>
        
        {/* Business Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center flex-shrink-0 border-4 border-white/20">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl">☕</span>
                )}
              </div>
              
              <div className="flex-1 text-white min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold truncate">{business.name}</h1>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                </div>
                
                {business.description && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-1 mb-2">{business.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 text-white/70 text-xs md:text-sm">
                  {business.address && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span className="truncate max-w-[200px]">{business.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>10:00 - 22:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Categories Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} className="text-orange-500" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                      selectedCategory === category._id
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryEmoji(category.name)}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category._id
                        ? 'bg-white/20'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.items.length}
                    </span>
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No categories yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Categories Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowMobileCategories(!showMobileCategories)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <span className="font-medium text-gray-800">Categories</span>
                <span className="text-orange-500">{showMobileCategories ? '▲' : '▼'}</span>
              </button>
              
              {showMobileCategories && (
                <div className="mt-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category._id);
                        setShowMobileCategories(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                        selectedCategory === category._id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm opacity-70">{category.items.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="space-y-8">
              {categories.map((category) => (
                <section key={category._id} id={`category-${category._id}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                      {getCategoryEmoji(category.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                    <span className="ml-auto text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {category.items.length} items
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {category.items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                      >
                        <div className="relative h-40 bg-gray-100 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                              {getCategoryEmoji(category.name)}
                            </div>
                          )}
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Unavailable
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                          )}
                          <span className="text-xl font-bold text-orange-500">
                            Br {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              
              {categories.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No menu items yet</h3>
                  <p className="text-gray-500">Check back later for delicious updates!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
