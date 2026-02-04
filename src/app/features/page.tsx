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
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ABC Cafe</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-amber-600 font-semibold">
                Features
              </Link>
              <Link href="/use-cases" className="text-slate-600 hover:text-slate-900 transition-colors">
                Use Cases
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
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
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Powerful Features for Modern Cafes
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Discover all the tools you need to streamline operations, delight customers, 
            and grow your cafe business - all in one intuitive platform.
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
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-slate-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 aspect-video flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <feature.icon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">{feature.title} Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Supercharge Your Cafe?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Start your free 14-day trial today and see how ABC Cafe can transform your operations.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">ABC Cafe</span>
            </div>
            <p className="text-slate-400 text-sm">© 2024 ABC Cafe. All rights reserved.</p>
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

