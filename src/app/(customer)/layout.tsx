"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MenuIcon, ShoppingCart, User, UtensilsCrossed, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PINTEREST_RED } from '@/utils/hero-teams';
import { Button } from '@/components/ui/Button';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">

      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-4">
        <div className='flex items-center justify-between w-full max-w-7xl mx-auto'>
          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
           <Link href="/" className="flex items-center gap-2 text-[#e60023] font-bold text-xl">
            <UtensilsCrossed className="w-8 h-8" />
            <span className="hidden sm:inline">QuickServe</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 font-semibold text-black">
            <a href="/menu" className="hover:text-gray-600 transition-colors">Explore</a>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 lg:gap-8 font-semibold text-black">
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link href="/menu" className="hover:text-gray-600 transition-colors">Menu</Link>
            <Link href="/reservations" className="hover:text-gray-600 transition-colors">Reservations</Link>
            <Link href="/orders" className="hover:text-gray-600 transition-colors">Orders</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e60023] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {user.status !== 'onboarding' && (
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="w-5 h-5" />
                      <span>{(user.full_name || user.username || 'User').split(' ')[0]}</span>
                    </Button>
                  </Link>
                )}
                {user.role !== 'customer' && (
                  <Link href={user.status === 'onboarding' ? '/company-setup' : (user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/cashier')}>
                    <Button variant="outline" size="sm" className="capitalize">
                      {user.status === 'onboarding' ? 'Complete Setup' : `${user.role} Panel`}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3 ml-3">
                <Link href={"/login"} className="bg-[#e60023] text-white px-4 md:px-5 py-2.5 rounded-full hover:bg-[#ad081b] transition-colors text-sm md:text-base font-bold">
                  Log in
                </Link>
                <Link href={"/signup"} className="bg-[#efefef] text-black px-4 md:px-5 py-2.5 rounded-full hover:bg-[#e2e2e2] transition-colors text-sm md:text-base font-bold whitespace-nowrap">
                  Sign up
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </Button>
          </div>
        </div>
        </div>
      </nav>

      <div className="flex-1">
        {children}
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <UtensilsCrossed className="w-6 h-6 text-[#e60023]" />
              <span>QuickServe</span>
            </div>
            <p className="text-sm">
              Providing modern self-service solutions for small restaurant companies.
              Fast, reliable, and delicious.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/menu">Our Menu</Link></li>
              <li><Link href="/reservations">Book a Table</Link></li>
              <li><Link href="/signup?role=admin" className="text-[#e60023] font-semibold">Register Business</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>123 Foodie Street, Gourmet City</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: hello@quickserve.com</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          © {new Date().getFullYear()} QuickServe Restaurant Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
