"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  CreditCard, Download, FileText, Calendar, CheckCircle, 
  AlertCircle, TrendingUp, Clock, DollarSign, Building2,
  X, Loader2, Send, XCircle
} from 'lucide-react';

// Pricing configuration (prices are INCLUDING VAT)
const PRICING = {
  basic: { daily: 100, name: 'Basic', features: ['Up to 5 users', 'Basic POS', 'Inventory', 'Reports', 'Email Support'] },
  pro: { daily: 250, name: 'Pro', features: ['Up to 20 users', 'Full POS', 'Advanced Inventory', 'Analytics', 'API Access', 'Priority Support'] },
  enterprise: { daily: 500, name: 'Enterprise', features: ['Unlimited users', 'Full POS', 'Advanced Inventory', 'Custom Analytics', 'Full API', 'Dedicated Support'] }
};

const VAT_RATE = 15;
const YEARLY_DISCOUNT = 20;

interface BankAccount {
  _id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface Invoice {
  _id: string;
  invoice_number: string;
  plan: string;
  billing_cycle: 'monthly' | 'yearly';
  days: number;
  subtotal: number;
  vat_amount: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'rejected';
  period_start: string;
  period_end: string;
  due_date: string;
  created_at: string;
}

interface Payment {
  _id: string;
  invoice_id: string;
  amount: number;
  bank_account: BankAccount;
  transaction_reference: string;
  payer_name: string;
  payer_phone: string;
  payer_email: string;
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  created_at: string;
}

interface Subscription {
  _id: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  billing_cycle: 'monthly' | 'yearly';
  daily_rate: number;
}

interface PriceCalculation {
  plan: string;
  plan_key: string;
  billing_cycle: string;
  days: number;
  daily_rate: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  subtotal_after_discount: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

export default function BillingPage() {
  const { user, jwt } = useAuth();
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'invoices' | 'payment'>('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: string; billing_cycle: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Form state for payment
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    transaction_reference: '',
    payer_name: '',
    payer_phone: '',
    payer_email: '',
    notes: ''
  });

  // Calculate price (prices are already including VAT)
  const calculatePrice = (plan: string, billingCycle: string): PriceCalculation => {
    const planData = PRICING[plan as keyof typeof PRICING];
    const days = billingCycle === 'yearly' ? 365 : 30;
    const dailyWithVAT = planData.daily;
    
    // Calculate subtotal (remove VAT)
    const subtotalWithVAT = dailyWithVAT * days;
    const subtotal = subtotalWithVAT / (1 + VAT_RATE / 100);
    const vatAmount = subtotalWithVAT - subtotal;
    
    // Apply discount for yearly
    const discountPercent = billingCycle === 'yearly' ? YEARLY_DISCOUNT : 0;
    const discount = subtotal * (discountPercent / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const total = subtotalAfterDiscount + vatAmount;

    return {
      plan: planData.name,
      plan_key: plan,
      billing_cycle: billingCycle,
      days,
      daily_rate: planData.daily,
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discount,
      subtotal_after_discount: subtotalAfterDiscount,
      vat_rate: VAT_RATE,
      vat_amount: vatAmount,
      total
    };
  };

  // Handle plan query parameter from pricing page
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && ['basic', 'pro', 'enterprise'].includes(planParam)) {
      setSelectedPlan({ plan: planParam, billing_cycle: 'monthly' });
      setShowSubscribeModal(true);
    }
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    if (jwt) {
      fetchBillingData();
    }
  }, [jwt]);

  const fetchBillingData = async () => {
    if (!jwt) return;
    
    setLoading(true);
    try {
      const headers = { 
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching billing data...');
      
      const [subRes, invRes, payRes, bankRes] = await Promise.all([
        fetch('http://localhost:8000/api/billing/subscription', { headers }),
        fetch('http://localhost:8000/api/billing/invoices', { headers }),
        fetch('http://localhost:8000/api/billing/payments', { headers }),
        fetch('http://localhost:8000/api/billing/bank-accounts', { headers })
      ]);

      console.log('Response status:', subRes.status, invRes.status, payRes.status, bankRes.status);

      const subData = await subRes.json();
      const invData = await invRes.json();
      const payData = await payRes.json();
      const bankData = await bankRes.json();

      console.log('Subscription data:', subData);
      console.log('Invoices data:', invData);
      console.log('Payments data:', payData);
      console.log('Bank accounts data:', bankData);

      if (subData.success) {
        setSubscription(subData.data);
        if (subData.message && subData.message.includes('No business')) {
          showNotification(subData.message, 'warning');
        }
      }
      if (invData.success) setInvoices(invData.data);
      if (payData.success) setPayments(payData.data);
      if (bankData.success) setBankAccounts(bankData.data);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      showNotification('Failed to load billing data. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription
  const handleCreateSubscription = async () => {
    if (!jwt || !selectedPlan) return;
    
    setSubmitting(true);
    console.log('Creating subscription for plan:', selectedPlan.plan, 'cycle:', selectedPlan.billing_cycle);

    try {
      const response = await fetch('http://localhost:8000/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ 
          plan: selectedPlan.plan, 
          billing_cycle: selectedPlan.billing_cycle 
        })
      });

      console.log('Subscription response status:', response.status);

      const data = await response.json();
      console.log('Subscription response data:', data);

      if (data.success) {
        showNotification('Subscription created successfully!', 'success');
        fetchBillingData();
        setShowSubscribeModal(false);
        setSelectedPlan(null);
        setActiveTab('invoices');
      } else {
        showNotification(data.message || 'Failed to create subscription. Please make sure you have a business set up.', 'error');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      showNotification('Failed to create subscription. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;
    
    setSubmitting(true);
    console.log('Submitting payment for invoice:', paymentForm.invoice_id);

    try {
      const response = await fetch('http://localhost:8000/api/billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify(paymentForm)
      });

      console.log('Payment response status:', response.status);

      const data = await response.json();
      console.log('Payment response data:', data);

      if (data.success) {
        showNotification('Payment submitted successfully!', 'success');
        setShowPaymentModal(false);
        setPaymentForm({
          invoice_id: '',
          bank_name: '',
          account_number: '',
          account_name: '',
          transaction_reference: '',
          payer_name: '',
          payer_phone: '',
          payer_email: '',
          notes: ''
        });
        fetchBillingData();
      } else {
        showNotification('error', data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      showNotification('Failed to submit payment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm(prev => ({ ...prev, invoice_id: invoice._id }));
    setShowPaymentModal(true);
  };

  const openSubscribeModal = (plan: string) => {
    setSelectedPlan({ plan, billing_cycle: billingCycle });
    setShowSubscribeModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      verified: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your subscription, invoices, and payments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'plans', label: 'Plans', icon: CreditCard },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'payment', label: 'Payment History', icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && subscription && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
                <p className="text-gray-500 text-sm mt-1">Your active subscription details</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(subscription.status)}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-semibold text-gray-900">{PRICING[subscription.plan]?.name || subscription.plan}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Daily Rate</p>
                    <p className="font-semibold text-gray-900">{subscription.daily_rate} ETB/day</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cycle</p>
                    <p className="font-semibold text-gray-900">{subscription.billing_cycle === 'yearly' ? 'Yearly (20% off)' : 'Monthly'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-semibold text-gray-900">{new Date(subscription.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-gray-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-3xl font-bold text-gray-900">{invoices.filter(i => i.status === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="text-amber-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed Payments</p>
                  <p className="text-3xl font-bold text-gray-900">{payments.filter(p => p.status === 'verified').length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-emerald-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab - No Subscription */}
      {activeTab === 'overview' && !subscription && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-gray-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
          <p className="text-gray-500 mb-6">Subscribe to a plan to start using the system.</p>
          <button
            onClick={() => setActiveTab('plans')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            View Plans
          </button>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-amber-800">Pricing Information</h3>
              <p className="text-sm text-amber-700 mt-1">
                All prices are in Ethiopian Birr (ETB). Displayed prices include 15% VAT. 
                Yearly billing gets a 20% discount on the subtotal.
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PRICING).map(([key, plan]) => {
              const price = calculatePrice(key, billingCycle);

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{price.total.toFixed(0)}</span>
                      <span className="text-gray-500 ml-2">ETB/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {plan.daily} ETB/day (includes 15% VAT)
                    </div>
                    {key === 'pro' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                        Most Popular
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={16} className="text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => openSubscribeModal(key)}
                      className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Subscribe {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
            <p className="text-gray-500 text-sm mt-1">View and pay your invoices</p>
          </div>
          
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No invoices yet</p>
              <button onClick={() => setActiveTab('plans')} className="mt-4 text-gray-900 font-medium hover:underline">
                Subscribe to a plan
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{invoice.invoice_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{invoice.plan}</span>
                        <span className="text-xs text-gray-500 ml-1">({invoice.billing_cycle})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{invoice.total.toFixed(2)} ETB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'pending' && !payments.some(p => p.invoice_id === invoice._id) && (
                            <button
                              onClick={() => openPaymentModal(invoice)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <Send size={14} />
                              Pay Now
                            </button>
                          )}
                          {(() => {
                            const payment = payments.find(p => p.invoice_id === invoice._id);
                            if (!payment) return null;
                            
                            if (payment.status === 'pending') {
                              return (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-700 bg-amber-100 rounded-lg">
                                  <Clock size={14} />
                                  Payment Pending
                                </span>
                              );
                            } else if (payment.status === 'verified') {
                              return (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-700 bg-emerald-100 rounded-lg">
                                  <CheckCircle size={14} />
                                  Payment Verified
                                </span>
                              );
                            } else if (payment.status === 'rejected') {
                              return (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-100 rounded-lg">
                                  <XCircle size={14} />
                                  Payment Rejected
                                </span>
                              );
                            }
                            return null;
                          })()}
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            <p className="text-gray-500 text-sm mt-1">Track your payment submissions</p>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payment records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{payment.bank_account.bank_name}</span>
                        <span className="text-xs text-gray-500 ml-1">({payment.bank_account.account_number})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{payment.transaction_reference}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{payment.payer_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{payment.amount.toFixed(2)} ETB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Subscribe to {PRICING[selectedPlan.plan as keyof typeof PRICING]?.name}</h2>
              <button onClick={() => { setShowSubscribeModal(false); setSelectedPlan(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Breakdown ({selectedPlan.billing_cycle})</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{PRICING[selectedPlan.plan as keyof typeof PRICING]?.daily} ETB × {selectedPlan.billing_cycle === 'yearly' ? '365' : '30'} days (incl. VAT)</span>
                    <span className="text-gray-900">{(PRICING[selectedPlan.plan as keyof typeof PRICING]?.daily * (selectedPlan.billing_cycle === 'yearly' ? 365 : 30)).toFixed(2)} ETB</span>
                  </div>
                  {selectedPlan.billing_cycle === 'yearly' && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Subtotal discount (20%)</span>
                      <span>-{calculatePrice(selectedPlan.plan, selectedPlan.billing_cycle).discount_amount.toFixed(2)} ETB</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span>Total (incl. VAT)</span>
                    <span>{calculatePrice(selectedPlan.plan, selectedPlan.billing_cycle).total.toFixed(2)} ETB</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Next Steps</p>
                    <p className="text-amber-700 mt-1">
                      After subscribing, you will receive an invoice. You can then make a bank transfer using one of our registered bank accounts.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateSubscription}
                disabled={submitting}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  'Confirm Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submit Payment</h2>
                <p className="text-gray-500 text-sm mt-1">Invoice: {selectedInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 text-gray-900">{selectedInvoice.plan}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount Due:</span>
                    <span className="ml-2 font-bold text-gray-900">{selectedInvoice.total.toFixed(2)} ETB</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 text-gray-900">{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Bank Accounts for Payment</h3>
                <div className="space-y-3">
                  {bankAccounts.map((bank, idx) => (
                    <div 
                      key={bank._id}
                      className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                        paymentForm.bank_name === bank.bank_name && paymentForm.account_number === bank.account_number
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentForm(prev => ({ ...prev, bank_name: bank.bank_name, account_number: bank.account_number, account_name: bank.account_name }))}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{bank.bank_name}</p>
                          <p className="text-sm text-gray-500">{bank.account_name}</p>
                          <p className="text-sm font-mono text-gray-700">{bank.account_number}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.transaction_reference}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentForm(prev => ({ ...prev, transaction_reference: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="e.g., Txn123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.payer_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentForm(prev => ({ ...prev, payer_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={paymentForm.payer_phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentForm(prev => ({ ...prev, payer_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="e.g., +251911234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={paymentForm.payer_email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentForm(prev => ({ ...prev, payer_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    rows={2}
                    placeholder="Any additional information"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Important</p>
                      <p className="text-amber-700 mt-1">
                        After making the payment, please keep your transaction receipt. Our team will verify your payment within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Payment Proof
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
