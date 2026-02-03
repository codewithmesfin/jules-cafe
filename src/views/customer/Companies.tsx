"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Globe, UtensilsCrossed, Loader2 } from 'lucide-react';
import { api } from '@/utils/api';

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  category?: string;
  primary_color?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        console.log('Fetching companies from API...');
        const response = await api.public.company.getAll();
        console.log('API Response:', response);
        
        // Handle different response structures
        if (response && response.data) {
          const companiesData = Array.isArray(response.data) ? response.data : [];
          setCompanies(companiesData);
          console.log('Companies loaded:', companiesData.length);
        } else if (Array.isArray(response)) {
          // Fallback if response is directly an array
          setCompanies(response);
          console.log('Companies loaded (array fallback):', response.length);
        } else {
          console.error('Unexpected response structure:', response);
          setError('Failed to load companies: unexpected response');
        }
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'cafe': return '☕';
      case 'restaurant': return '🍽️';
      case 'coffee_shop': return '🎯';
      case 'bar': return '🍸';
      case 'bakery': return '🥐';
      default: return '🍴';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#e60023] mx-auto mb-4" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#e60023] text-white px-6 py-2 rounded-full hover:bg-[#ad081b] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#e60023] rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Explore Our Restaurants
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing dining experiences from our registered restaurants, cafes, and bars.
            Click on any restaurant to visit their menu and place orders.
          </p>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {companies.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants yet</h3>
              <p className="text-gray-600 mb-8">Be the first to register your restaurant!</p>
              <Link 
                href="/signup?role=admin"
                className="inline-block bg-[#e60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ad081b] transition-colors"
              >
                Register Your Restaurant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/${company.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                >
                  {/* Logo/Header */}
                  <div 
                    className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden"
                    style={{
                      background: company.primary_color 
                        ? `linear-gradient(135deg, ${company.primary_color}20, ${company.primary_color}40)`
                        : undefined
                    }}
                  >
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">{getCategoryIcon(company.category)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {getCategoryIcon(company.category)} {company.category || 'Restaurant'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#e60023] transition-colors">
                      {company.name}
                    </h3>
                    {company.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm text-gray-500">
                      {company.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{company.address}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-2 text-[#e60023] font-semibold group-hover:gap-3 transition-all">
                        View Menu
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {companies.length > 0 && (
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Own a restaurant?
            </h2>
            <p className="text-gray-600 mb-8">
              Join our platform and reach more customers with our easy-to-use ordering and management system.
            </p>
            <Link 
              href="/signup?role=admin"
              className="inline-block bg-[#e60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ad081b] transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Companies;
