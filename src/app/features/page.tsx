"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ChefHat,
  Utensils, 
  ChartBar, 
  Users, 
  Clock, 
  Shield,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Wifi,
  CreditCard,
  TrendingUp,
  Menu,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Utensils,
    title: 'Order Management',
    description: 'Take orders from multiple channels - in-store, online, and phone. Track order status in real-time from preparation to delivery.',
    benefits: [
      'Multi-channel order capture (POS, online, phone)',
      'Real-time order status tracking',
      'Order modifications and cancellations',
      'Order history and reordering',
    ],
  },
  {
    icon: ChartBar,
    title: 'Point of Sale',
    description: 'A modern, intuitive POS system designed for speed and accuracy. Process transactions in seconds.',
    benefits: [
      'Touch-friendly interface',
      'Quick item lookup and modifiers',
      'Split bill and partial payments',
      'Receipt customization',
    ],
  },
  {
    icon: Users,
    title: 'Table Management',
    description: 'Manage table reservations, track occupancy, and optimize seating for maximum efficiency.',
    benefits: [
      'Visual table layout',
      'Reservation scheduling',
      'Table turnover tracking',
      'Waitlist management',
    ],
  },
  {
    icon: Clock,
    title: 'Kitchen Display System',
    description: 'Streamline kitchen operations with digital order tickets and priority management.',
    benefits: [
      'Digital order tickets',
      'Prep time tracking',
      'Priority and rush order handling',
      'Allergy and special instruction alerts',
    ],
  },
  {
    icon: Menu,
    title: 'Menu Management',
    description: 'Easily manage your menu items, prices, and availability across all channels.',
    benefits: [
      'Category and item management',
      'Price scheduling',
      'Item availability toggles',
      'Modifier and combo management',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Inventory Management',
    description: 'Track ingredients, get low-stock alerts, and reduce waste with smart inventory control.',
    benefits: [
      'Real-time stock tracking',
      'Automatic reorder alerts',
      'Waste tracking and reporting',
      'Supplier management',
    ],
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Build customer relationships with profiles, purchase history, and loyalty programs.',
    benefits: [
      'Customer profiles and preferences',
      'Purchase history tracking',
      'Loyalty and rewards program',
      'Automated marketing campaigns',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Get actionable insights with customizable reports on sales, inventory, and customer behavior.',
    benefits: [
      'Sales analytics dashboard',
      'Product performance reports',
      'Staff performance metrics',
      'Export to CSV/PDF',
    ],
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Track revenue, expenses, and profits with integrated accounting features.',
    benefits: [
      'Revenue tracking by channel',
      'Expense management',
      'Profit margin analysis',
      'Tax reporting tools',
    ],
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Manage your cafe on the go with our powerful mobile app for owners and managers.',
    benefits: [
      'Real-time dashboard access',
      'Push notifications',
      'Remote order management',
      'Staff scheduling',
    ],
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Accept all payment types with integrated payment processing and secure transactions.',
    benefits: [
      'Credit/debit card processing',
      'Mobile payments (Apple Pay, Google Pay)',
      'Gift card support',
      'Split payments',
    ],
  },
  {
    icon: Wifi,
    title: 'Online Ordering',
    description: 'Let customers order online with a branded ordering portal and real-time updates.',
    benefits: [
      'Branded online store',
      'Real-time order status',
      'Scheduled ordering',
      'Delivery integration',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 font-black tracking-tight">Quick Serve</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-[#e60023] font-bold">
                Features
              </Link>
              <Link href="/use-cases" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Use Cases
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2.5 bg-[#e60023] text-white rounded-full hover:bg-[#ad081b] transition-all font-bold shadow-lg shadow-red-900/10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Powerful Features for Modern Restaurants
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto font-medium">
            Discover all the tools you need to streamline operations, delight customers, 
            and grow your business - all in one intuitive platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                    <feature.icon className="w-10 h-10 text-[#e60023]" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">{feature.title}</h2>
                  <p className="text-lg text-slate-500 mb-8 font-medium leading-relaxed">{feature.description}</p>
                  <ul className="space-y-4">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2.5rem] shadow-premium border border-slate-100 p-8 lg:p-12 aspect-video flex items-center justify-center group overflow-hidden relative">
                    <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="text-center text-slate-300 relative z-10">
                      <feature.icon className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 ease-out" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{feature.title} Interface</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-[#e60023] rounded-full blur-[150px]"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black mb-8 tracking-tight">
            Ready to Supercharge Your Restaurant?
          </h2>
          <p className="text-lg lg:text-xl text-slate-400 mb-12 font-medium">
            Start your free 14-day trial today and see how Quick Serve can transform your operations.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#e60023] text-white rounded-2xl font-black hover:bg-[#ad081b] transition-all hover:scale-105 shadow-2xl shadow-red-900/40"
          >
            Start Free Trial
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e60023] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">Quick Serve</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">© 2024 Quick Serve. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">Home</Link>
              <Link href="/use-cases" className="text-slate-400 hover:text-white transition-colors text-sm">Use Cases</Link>
              <Link href="/signup" className="text-slate-400 hover:text-white transition-colors text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

