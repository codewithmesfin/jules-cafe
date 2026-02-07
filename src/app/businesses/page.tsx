"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, ArrowRight, Loader2, Store, Clock, Star } from 'lucide-react';

interface Business {
  _id: string;
  name: string;
  slug: string;
  legal_name: string;
  description: string;
  address: string;
  logo?: string;
  banner?: string;
}

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/public/businesses`);
      const data = await response.json();
      
      if (data.success) {
        setBusinesses(data.data);
      } else {
        setError(data.message || 'Failed to load businesses');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessClick = (business: Business) => {
    // Navigate to the business menu page using business_id
    router.push(`/businesses/${business._id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Our Partner Businesses</h1>
          <p className="text-slate-500">Discover amazing cafes and restaurants in our network</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={40} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-rose-500 mb-4">{error}</p>
            <button
              onClick={fetchBusinesses}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && businesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No businesses available at the moment.</p>
          </div>
        )}

        {/* Businesses Grid */}
        {!loading && !error && businesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <div
                key={business._id}
                onClick={() => handleBusinessClick(business)}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                {/* Banner Image */}
                <div className="relative h-40 bg-slate-100">
                  {business.banner ? (
                    <img
                      src={business.banner}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Store size={48} className="text-slate-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Open
                  </div>
                </div>

                {/* Business Info */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 -mt-8 relative z-10">
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Store size={24} className="text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {business.name}
                      </h2>
                      <p className="text-sm text-slate-500 truncate">{business.legal_name}</p>
                    </div>
                  </div>

                  {business.description && (
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    {business.address && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={14} />
                        <span className="truncate max-w-[120px]">{business.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                      <Clock size={14} />
                      <span>10:00 - 22:00</span>
                    </div>
                  </div>

                  {/* View Menu Button */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">
                      <span>View Menu</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-amber-500" />
                      <span className="text-sm font-medium text-slate-700">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowRight size={18} className="rotate-180" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>

      {/* Common Footer */}
      <Footer />
    </div>
  );
}
