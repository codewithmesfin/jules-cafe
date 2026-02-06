"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CheckIcon, StarIcon, ArrowRight, Shield, Zap, CreditCard, Clock, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PRICING_PLAN = {
  id: 'standard',
  name: 'Standard Plan',
  description: 'Everything you need to run your cafe or restaurant efficiently',
  dailyPrice: 100,
  monthlyTotal: 3043, // ~100 ETB/day * 30 days with VAT
  yearlyTotal: 30435, // 365 days with 20% discount
  features: [
    'Unlimited users & staff accounts',
    'Full POS system',
    'Inventory management',
    'Order tracking & history',
    'Analytics & reports',
    'Customer database',
    'Table management',
    'Recipe & menu builder',
    'Multi-payment support',
    'Email & chat support',
    'Daily cloud backup',
    'Auto updates',
  ],
};

const FEATURES = [
  { icon: '🖥️', name: 'POS System', included: true },
  { icon: '📦', name: 'Inventory', included: true },
  { icon: '📊', name: 'Reports', included: true },
  { icon: '👥', name: 'Staff Management', included: true },
  { icon: '🍽️', name: 'Table Orders', included: true },
  { icon: '📱', name: 'Mobile Ordering', included: true },
  { icon: '💳', name: 'Payment Processing', included: true },
  { icon: '📧', name: 'Email Support', included: true },
  { icon: '☁️', name: 'Cloud Backup', included: true },
  { icon: '🔄', name: 'Auto Updates', included: true },
  { icon: '🎯', name: 'Custom Branding', included: true },
  { icon: '📈', name: 'Advanced Analytics', included: true },
];

const PRICINGPage: React.FC = () => {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);

  const VAT_RATE = 15;
  const YEARLY_DISCOUNT = 20;

  const calculateSubtotal = (priceWithVAT: number): number => {
    return priceWithVAT / (1 + VAT_RATE / 100);
  };

  const calculatePeriodSubtotal = (dailyPrice: number, interval: 'month' | 'year'): number => {
    const days = interval === 'year' ? 365 : 30;
    const dailySubtotal = calculateSubtotal(dailyPrice);
    return dailySubtotal * days;
  };

  const calculateTotalWithVAT = (dailyPrice: number, interval: 'month' | 'year'): number => {
    const subtotal = calculatePeriodSubtotal(dailyPrice, interval);
    if (interval === 'year') {
      const discount = subtotal * (YEARLY_DISCOUNT / 100);
      return subtotal - discount;
    }
    return subtotal + subtotal * (VAT_RATE / 100);
  };

  const handleSelectPlan = () => {
    setLoading('standard');
    if (router.push) router.push('/dashboard/billing');
  };

  const totalWithVAT = calculateTotalWithVAT(PRICING_PLAN.dailyPrice, billingInterval);
  const yearlyDiscount = billingInterval === 'year' 
    ? calculatePeriodSubtotal(PRICING_PLAN.dailyPrice, 'year') * (YEARLY_DISCOUNT / 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <StarIcon size={16} className="fill-orange-500" />
            <span>Simple, transparent pricing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Run Your Business<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Like a Pro
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            One powerful plan with all features included. No hidden fees, no surprises. 
            Just everything you need to succeed.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-2xl p-2 shadow-lg border border-slate-200">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                billingInterval === 'month'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billingInterval === 'year'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="relative -mt-16 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-center">
              <span className="text-white text-sm font-medium">Most Popular Choice</span>
            </div>
            
            <div className="pt-12 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {PRICING_PLAN.name}
              </h3>
              <p className="text-slate-500 mb-6">{PRICING_PLAN.description}</p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-6xl font-bold text-slate-900">
                    {PRICING_PLAN.dailyPrice}
                  </span>
                  <span className="text-slate-500 text-xl">ETB<span className="text-lg">/day</span></span>
                </div>
                <p className="text-sm text-slate-400">
                  Equals {billingInterval === 'year' ? '~84 ETB' : '100 ETB'} per day with VAT
                </p>
              </div>

              {/* Period Total */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">
                    {billingInterval === 'year' ? 'Yearly' : 'Monthly'} payment
                  </span>
                  <span className="text-3xl font-bold text-slate-900">
                    {totalWithVAT.toFixed(0)} ETB
                  </span>
                </div>
                {billingInterval === 'year' && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckIcon size={16} />
                    <span className="text-sm font-medium">
                      You save {yearlyDiscount.toFixed(0)} ETB with yearly billing!
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSelectPlan}
                disabled={loading === 'standard'}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                {loading === 'standard' ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-400 mt-4">
                15% VAT included • Cancel anytime
              </p>
            </div>

            {/* Features */}
            <div className="px-8 pb-8">
              <p className="text-sm font-semibold text-slate-700 mb-4">Everything included:</p>
              <div className="grid grid-cols-2 gap-3">
                {PRICING_PLAN.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              All Features Included
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No upcharges, no add-ons, no surprises. Everything you need is included in one simple price.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-all group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-slate-900">{feature.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-emerald-600">
                  <CheckIcon size={14} className="fill-emerald-500" />
                  <span className="text-sm font-medium">Included</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Get Started in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '1',
                title: 'Subscribe',
                description: 'Choose monthly or yearly billing and subscribe to the Standard plan.',
                color: 'bg-orange-500',
              },
              {
                icon: '2',
                title: 'Pay',
                description: 'Receive your invoice and make a bank transfer to our account.',
                color: 'bg-amber-500',
              },
              {
                icon: '3',
                title: 'Activate',
                description: 'Once payment is verified, your account is instantly activated!',
                color: 'bg-emerald-500',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full -translate-x-1/2">
                    <ArrowRight className="text-slate-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What happens if I miss a payment?',
                a: 'If payment is not received within 7 days, your subscription will expire and your business account will be temporarily deactivated until payment is made.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your subscription will remain active until the end of the current billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept bank transfers to our registered bank accounts. After subscribing, you will receive invoice and payment instructions.',
              },
              {
                q: 'Is there a free trial?',
                a: 'We offer a 7-day trial period for new businesses. Contact us to get started with your free trial.',
              },
              {
                q: 'Can I switch between monthly and yearly billing?',
                a: 'Yes, you can change your billing cycle at any time. The new rate will apply from your next billing cycle.',
              },
              {
                q: 'Do you offer discounts for multiple locations?',
                a: 'Yes! Contact our sales team for special pricing on multi-location businesses.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <HelpCircle size={18} className="text-orange-500" />
                  {faq.q}
                </h3>
                <p className="text-slate-600 pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join hundreds of businesses already using ABC Cafe to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSelectPlan}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
            >
              Start Free Trial
            </button>
            <Link
              href="/businesses"
              className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
            >
              View Businesses
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-slate-500">
              <Shield size={20} />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Zap size={20} />
              <span className="text-sm font-medium">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={20} />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <CreditCard size={20} />
              <span className="text-sm font-medium">ETB Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold">ABC Cafe</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} ABC Cafe Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PRICINGPage;
