"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PRICING_PLAN = {
  id: 'standard',
  name: 'Standard',
  description: 'Perfect for cafes and restaurants of all sizes',
  dailyPrice: 100, // 100 ETB/day (including VAT)
  features: [
    'Unlimited users',
    'Full POS functionality',
    'Inventory management',
    'Order management',
    'Analytics & reports',
    'Customer management',
    'Table management',
    'Recipe management',
    'Email support',
  ],
};

const PricingPage: React.FC = () => {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);

  const VAT_RATE = 15;
  const YEARLY_DISCOUNT = 20;

  // Calculate subtotal (remove VAT) from the given price
  const calculateSubtotal = (priceWithVAT: number): number => {
    return priceWithVAT / (1 + VAT_RATE / 100);
  };

  // Calculate subtotal for period
  const calculatePeriodSubtotal = (dailyPrice: number, interval: 'month' | 'year'): number => {
    const days = interval === 'year' ? 365 : 30;
    const dailySubtotal = calculateSubtotal(dailyPrice);
    return dailySubtotal * days;
  };

  // Calculate total with discount and VAT
  const calculateTotalWithVAT = (dailyPrice: number, interval: 'month' | 'year'): number => {
    const subtotal = calculatePeriodSubtotal(dailyPrice, interval);
    
    if (interval === 'year') {
      const discount = subtotal * (YEARLY_DISCOUNT / 100);
      const afterDiscount = subtotal - discount;
      return afterDiscount; // VAT already included in the original price
    }
    
    return subtotal + subtotal * (VAT_RATE / 100);
  };

  const handleSelectPlan = () => {
    setLoading('standard');
    router.push('/dashboard/billing');
  };

  const totalWithVAT = calculateTotalWithVAT(PRICING_PLAN.dailyPrice, billingInterval);
  const monthlySubtotal = calculatePeriodSubtotal(PRICING_PLAN.dailyPrice, 'month');
  const yearlySubtotal = calculatePeriodSubtotal(PRICING_PLAN.dailyPrice, 'year');
  const yearlyDiscount = yearlySubtotal * (YEARLY_DISCOUNT / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto px-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            One plan for all businesses. All prices in Ethiopian Birr (ETB).
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'month'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === 'year'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-xl mx-auto px-4">
          <Card
            className="relative border-2 border-slate-900 shadow-xl"
            padding="none"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {PRICING_PLAN.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {PRICING_PLAN.description}
              </p>

              {/* Main Price Display - Per Day */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-slate-900">
                  {PRICING_PLAN.dailyPrice}
                </span>
                <span className="text-slate-500 text-lg">
                  ETB/day
                </span>
              </div>

              {/* VAT Included Note */}
              <p className="text-xs text-slate-400 mb-3">
                Includes 15% VAT
              </p>

              {/* Total for period */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  {billingInterval === 'year' ? 'Yearly' : 'Monthly'} total:
                  <span className="font-bold text-slate-900 ml-2 text-lg">{totalWithVAT.toFixed(0)} ETB</span>
                </p>
                {billingInterval === 'year' && (
                  <p className="text-xs text-emerald-600 mt-1">
                    You save {yearlyDiscount.toFixed(0)} ETB ({YEARLY_DISCOUNT}% discount)
                  </p>
                )}
              </div>
            </div>

            <div className="p-6">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSelectPlan}
                isLoading={loading === 'standard'}
              >
                Subscribe Now
              </Button>
            </div>

            <div className="px-6 pb-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  What's included:
                </p>
                {PRICING_PLAN.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Price Breakdown Info */}
        <div className="max-w-4xl mx-auto px-4 mt-16">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-800 mb-2">Price Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-700">
              <div>
                <p>• All prices are in Ethiopian Birr (ETB)</p>
                <p>• Displayed prices include 15% VAT</p>
                <p>• Price shown is per day (including VAT)</p>
              </div>
              <div>
                <p>• Yearly billing includes 20% discount on subtotal</p>
                <p>• Payment via bank transfer to our registered accounts</p>
                <p>• No long-term commitment - cancel anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto px-4 mt-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Subscribe',
                description: 'Choose your billing cycle and subscribe to the Standard plan for just 100 ETB/day.',
              },
              {
                step: '2',
                title: 'Pay',
                description: 'Make a bank transfer using our payment instructions. Your invoice will be generated automatically.',
              },
              {
                step: '3',
                title: 'Activate',
                description: 'Once payment is verified, your subscription is activated and you can start using the system.',
              },
            ].map((item, index) => (
              <Card key={index} padding="comfortable">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 mt-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
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
                q: 'How do I get started?',
                a: 'Subscribe to the plan, receive your invoice, make the payment, and your account will be activated immediately after payment verification.',
              },
            ].map((faq, index) => (
              <Card key={index} padding="comfortable">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-slate-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2024 ABC Cafe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
