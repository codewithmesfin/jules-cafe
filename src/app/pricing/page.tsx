"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  dailyPrice: number; // This is the price INCLUDING VAT
  features: string[];
  limitations: string[];
  recommended?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small cafes and food trucks',
    dailyPrice: 100, // 100 ETB/day (including VAT)
    features: [
      'Up to 5 users',
      'Basic POS functionality',
      'Inventory management',
      'Order management',
      'Basic reports',
      'Email support',
    ],
    limitations: [
      'No multi-location',
      'No API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for growing restaurant chains',
    dailyPrice: 250, // 250 ETB/day (including VAT)
    features: [
      'Up to 20 users',
      'Full POS functionality',
      'Advanced inventory management',
      'Order management',
      'Advanced analytics & reports',
      'Multi-location support',
      'API access',
      'Priority email & chat support',
    ],
    limitations: [],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large restaurant groups',
    dailyPrice: 500, // 500 ETB/day (including VAT)
    features: [
      'Unlimited users',
      'Full POS functionality',
      'Advanced inventory management',
      'Order management',
      'Custom analytics & reports',
      'Unlimited multi-location',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
    ],
    limitations: [],
  },
];

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

  const handleSelectPlan = (planId: string) => {
    setLoading(planId);
    router.push(`/dashboard/billing?plan=${planId}`);
  };

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
            Choose the perfect plan for your business. All prices in Ethiopian Birr (ETB).
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

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => {
              const totalWithVAT = calculateTotalWithVAT(plan.dailyPrice, billingInterval);
              const monthlySubtotal = calculatePeriodSubtotal(plan.dailyPrice, 'month');
              const yearlySubtotal = calculatePeriodSubtotal(plan.dailyPrice, 'year');
              const yearlyDiscount = yearlySubtotal * (YEARLY_DISCOUNT / 100);

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.recommended
                      ? 'border-2 border-slate-900 shadow-xl scale-105 z-10'
                      : ''
                  }`}
                  padding="none"
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {plan.description}
                    </p>

                    {/* Main Price Display - Per Day */}
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-slate-900">
                        {plan.dailyPrice}
                      </span>
                      <span className="text-slate-500">
                        ETB/day
                      </span>
                    </div>

                    {/* VAT Included Note */}
                    <p className="text-xs text-slate-400 mb-3">
                      Includes 15% VAT
                    </p>

                    {/* Total for period */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">
                        {billingInterval === 'year' ? 'Yearly' : 'Monthly'} total:
                        <span className="font-bold text-slate-900 ml-2">{totalWithVAT.toFixed(0)} ETB</span>
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
                      variant={plan.recommended ? 'primary' : 'outline'}
                      fullWidth
                      size="lg"
                      onClick={() => handleSelectPlan(plan.id)}
                      isLoading={loading === plan.id}
                    >
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                    </Button>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        What's included:
                      </p>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-slate-700 mt-4 mb-3">
                            Not included:
                          </p>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <XIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-500">
                                {limitation}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
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
              </div>
            </div>
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
                q: 'Can I change my plan later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated accordingly.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No, all our plans are month-to-month with no long-term commitment. You can cancel anytime.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept bank transfers to our registered bank accounts. After subscribing, you will receive invoice and payment instructions.',
              },
              {
                q: 'How do I get started?',
                a: 'Select a plan, create your account, and you will be guided through the setup process. You can start using the system immediately.',
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

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            Need a custom solution? We're here to help.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
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
