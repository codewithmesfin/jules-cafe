"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  ArrowRight,
  CheckCircle,
  Store,
  ChefHat,
  Truck,
  Building,
  Users
} from 'lucide-react';

const useCases = [
  {
    icon: Store,
    title: 'Single Location Cafe',
    description: 'Perfect for independent cafe owners who want to streamline operations without complexity.',
    benefits: [
      'Easy setup and onboarding',
      'All-in-one solution for orders, inventory, and customers',
      'No IT expertise required',
      'Affordable pricing for small businesses',
    ],
    stats: [
      { value: '40%', label: 'Faster order processing' },
      { value: '25%', label: 'Reduced waste' },
      { value: '3x', label: 'More repeat customers' },
    ],
  },
  {
    icon: Building,
    title: 'Multi-Location Cafe Chains',
    description: 'Scale your cafe business across multiple locations with centralized management and reporting.',
    benefits: [
      'Centralized inventory management',
      'Multi-location analytics and reporting',
      'Unified customer loyalty program',
      'Consistent operations across all locations',
    ],
    stats: [
      { value: '30%', label: 'Time saved on management' },
      { value: '50%', label: 'Faster reporting' },
      { value: '20%', label: 'Increased revenue' },
    ],
  },
  {
    icon: Truck,
    title: 'Cafe with Delivery',
    description: 'Expand your reach with integrated delivery management and online ordering.',
    benefits: [
      'Integrated online ordering portal',
      'Delivery tracking and ETA updates',
      'Delivery partner integrations',
      'Delivery-specific reporting',
    ],
    stats: [
      { value: '2x', label: 'Order volume growth' },
      { value: '35%', label: 'Lower delivery costs' },
      { value: '4.8★', label: 'Customer satisfaction' },
    ],
  },
  {
    icon: ChefHat,
    title: 'Coffee Shop with Bakery',
    description: 'Manage both coffee and food items with specialized tracking for perishable goods.',
    benefits: [
      'Freshness tracking for baked goods',
      'Combo meal management',
      'Ingredient-level inventory',
      'Waste reduction analytics',
    ],
    stats: [
      { value: '60%', label: 'Less food waste' },
      { value: '45%', label: 'Faster prep time' },
      { value: '15%', label: 'Higher margins' },
    ],
  },
];

const testimonials = [
  {
    quote: "ABC Cafe transformed our single location into a thriving business. We doubled our revenue in the first year!",
    author: "Sarah Johnson",
    role: "Owner, The Daily Grind",
    location: "Portland, OR",
    rating: 5,
  },
  {
    quote: "Managing 5 locations used to be a nightmare. Now it's as easy as checking my phone.",
    author: "Michael Chen",
    role: "Founder, Brew Bros",
    location: "San Francisco, CA",
    rating: 5,
  },
  {
    quote: "The inventory management alone paid for the subscription. We've cut waste by 60%.",
    author: "Emily Rodriguez",
    role: "Manager, Sweet Spot Cafe",
    location: "Austin, TX",
    rating: 5,
  },
];

const faqs = [
  {
    question: "Can I try ABC Cafe before committing?",
    answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.",
  },
  {
    question: "Do I need special hardware?",
    answer: "ABC Cafe works with any device that has a browser. We also support popular POS hardware like Square readers and receipt printers.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption and are PCI compliant. Your data is backed up daily and stored in secure cloud servers.",
  },
  {
    question: "Can I switch from another system?",
    answer: "Yes! We offer free migration assistance. Our team will help you import your data from your current system.",
  },
];

export default function UseCasesPage() {
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
              <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link href="/use-cases" className="text-amber-600 font-semibold">
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
            Built for Every Type of Cafe
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Whether you're running a cozy coffee shop or a multi-location cafe chain, 
            ABC Cafe has the tools you need to succeed.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {useCases.map((useCase, i) => (
              <div 
                key={i} 
                className={`flex flex-col lg:flex-row gap-12 items-start ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <useCase.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">{useCase.title}</h2>
                  <p className="text-lg text-slate-600 mb-8">{useCase.description}</p>
                  <ul className="space-y-4 mb-8">
                    {useCase.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {useCase.stats.map((stat, j) => (
                        <div key={j} className="bg-white rounded-xl p-4 text-center shadow-sm">
                          <p className="text-2xl font-bold text-amber-600">{stat.value}</p>
                          <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-sm text-slate-600 mb-4">Average customer results after 6 months</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                        </div>
                        <span className="text-sm text-slate-500">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Cafe Owners Everywhere
            </h2>
            <p className="text-lg text-slate-600">
              See what our customers have to say about their experience with ABC Cafe.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <span key={j} className="text-amber-500">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                  <p className="text-sm text-amber-600">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Have questions? We've got answers.
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Cafe?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join 500+ cafe owners who trust ABC Cafe to power their business.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all hover:scale-105"
          >
            Start Free 14-Day Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">No credit card required • Cancel anytime</p>
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
              <Link href="/features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</Link>
              <Link href="/signup" className="text-slate-400 hover:text-white transition-colors text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
