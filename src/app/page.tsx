"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  Utensils, 
  ChartBar, 
  Users, 
  Clock, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ABC Cafe</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link href="/use-cases" className="text-slate-600 hover:text-slate-900 transition-colors">
                Use Cases
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Trusted by 500+ cafes worldwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              The Complete Cafe Management Solution
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8">
              Streamline your cafe operations, manage orders, track inventory, 
              and grow your business with ABC Cafe - the all-in-one platform 
              designed for modern cafe owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/use-cases" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-300 transition-all"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-amber-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-block px-4 py-1 bg-white rounded-lg text-xs text-slate-500 border border-slate-200">
                    abc-cafe.dashboard
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Revenue Today', value: '$1,284', change: '+12%' },
                    { label: 'Active Orders', value: '8', change: '+3' },
                    { label: 'Tables Occupied', value: '12/15', change: '80%' },
                    { label: 'Customers', value: '47', change: '+8' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-48 flex items-center justify-center">
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-6 bg-amber-500 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Run Your Cafe
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From order taking to inventory management, ABC Cafe has got you covered 
              with powerful features designed specifically for cafe operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Utensils,
                title: 'Order Management',
                description: 'Take orders, track status, and manage tables all in one place with real-time updates.',
              },
              {
                icon: ChartBar,
                title: 'Analytics & Reports',
                description: 'Get detailed insights into sales, popular items, and business performance.',
              },
              {
                icon: Users,
                title: 'Customer Management',
                description: 'Build customer profiles, track preferences, and run loyalty programs.',
              },
              {
                icon: Clock,
                title: 'Inventory Tracking',
                description: 'Never run out of ingredients. Automatic alerts for low stock items.',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Your data is safe with enterprise-grade security and automatic backups.',
              },
              {
                icon: Coffee,
                title: 'Multi-Location',
                description: 'Manage multiple cafe locations from a single dashboard.',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/features" 
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              View All Features
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Cafe?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join hundreds of cafe owners who trust ABC Cafe to streamline their operations 
            and grow their business.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105"
          >
            Start Free 14-Day Trial
          </Link>
          <p className="text-sm text-slate-500 mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">ABC Cafe</span>
              </div>
              <p className="text-slate-400">
                The complete cafe management solution for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            © 2024 ABC Cafe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
