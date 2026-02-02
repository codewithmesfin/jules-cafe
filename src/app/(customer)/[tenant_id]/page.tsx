"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { UtensilsCrossed, Menu, Calendar, ShoppingBag, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const TenantLandingPage = () => {
  const params = useParams();
  const tenantId = params?.tenant_id as string;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 text-[#e60023] mb-6">
          <UtensilsCrossed size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Our Restaurant
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Experience the finest dining with our premium service.
          Browse our menu, make a reservation, or track your orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href={`/${tenantId}/menu`} className="group">
          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-[#e60023] transition-all bg-white hover:shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-50 group-hover:text-[#e60023] transition-colors">
              <Menu size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Menu</h3>
            <p className="text-gray-500 text-sm">Explore our delicious variety of dishes and drinks.</p>
          </div>
        </Link>

        <Link href={`/${tenantId}/reservations`} className="group">
          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-[#e60023] transition-all bg-white hover:shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-50 group-hover:text-[#e60023] transition-colors">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Reservations</h3>
            <p className="text-gray-500 text-sm">Book a table in advance for a perfect dining experience.</p>
          </div>
        </Link>

        <Link href={`/${tenantId}/orders`} className="group">
          <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-[#e60023] transition-all bg-white hover:shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-50 group-hover:text-[#e60023] transition-colors">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Orders</h3>
            <p className="text-gray-500 text-sm">Check the status of your current or past orders.</p>
          </div>
        </Link>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link href={`/${tenantId}/login`}>
          <Button variant="outline" size="lg" className="gap-2">
            <LogIn size={20} /> Login
          </Button>
        </Link>
        <Link href={`/${tenantId}/signup`}>
          <Button size="lg" className="gap-2 bg-[#e60023] hover:bg-[#ad081b]">
            <UserPlus size={20} /> Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TenantLandingPage;
