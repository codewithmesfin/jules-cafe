"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckIcon, XIcon } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limitations: string[];
  recommended?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small cafes and food trucks',
    price: 299,
    interval: 'month',
    features: [
      'Up to 3 users',
      'Basic POS functionality',
      'Inventory management',
      'Order management',
      'Basic reports',
      'Email support',
    ],
    limitations: [
      'No multi-location',
      'No API access',
      'No advanced analytics',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing restaurant chains',
    price: 599,
    interval: 'month',
    features: [
      'Up to 10 users',
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
    price: 1299,
    interval: 'month',
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
      'White-label options',
    ],
    limitations: [],
  },
];

const PricingPage: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const calculatePrice = (price: number, interval: 'month' | 'year'): number => {
    if (interval === 'year') {
      return Math.round(price * 10); // 2 months free for annual
    }
    return price;
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Navigate to checkout/invoice page with selected plan
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
            Choose the perfect plan for your business. All plans include a 14-day free trial.
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
              <span className="ml-2 text-xs bg-success-500 text-white px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended
                    ? 'border-2 border-primary-500 shadow-xl scale-105 z-10'
                    : ''
                }`}
                padding="none"
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
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

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      ${calculatePrice(plan.price, billingInterval)}
                    </span>
                    <span className="text-slate-500">
                      /{billingInterval === 'year' ? 'year' : 'month'}
                    </span>
                  </div>

                  {billingInterval === 'year' && plan.price > 0 && (
                    <p className="text-sm text-success-600 mt-1">
                      Save ${plan.price * 2} per year
                    </p>
                  )}
                </div>

                <div className="p-6">
                  <Button
                    variant={plan.recommended ? 'primary' : 'outline'}
                    fullWidth
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </div>

                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      What's included:
                    </p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
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
                q: 'Can I change my plan later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated accordingly.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No, all our plans are month-to-month with no long-term commitment. You can cancel anytime.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, bank transfers, and mobile money payments.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a full refund within the first 7 days of your subscription if you are not satisfied.',
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
