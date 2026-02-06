"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  CreditCard, Download, FileText, Calendar, CheckCircle, 
  AlertCircle, TrendingUp, Clock, DollarSign, Building2,
  X, Loader2, Send, XCircle, RefreshCw
} from 'lucide-react';

// Pricing configuration - Only 100 ETB/day including VAT
const PRICING = {
  standard: { daily: 100, name: 'Standard', features: ['Unlimited users', 'Full POS', 'Inventory', 'Analytics', 'Priority Support'] }
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
  plan: 'standard';
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
  const { user, jwt, refreshUser } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment'>('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [autoCreating, setAutoCreating] = useState(false);

  // Redirect if business is inactive and user tries to access other pages
  useEffect(() => {
    if (user && user.businessInactive) {
      // User is on billing page - show full message but allow access
      return;
    }
  }, [user]);
  
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
  const calculatePrice = (billingCycle: string): PriceCalculation => {
    const planData = PRICING.standard;
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
      plan_key: 'standard',
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

  // Auto-create subscription for new businesses
  const autoCreateSubscription = async () => {
    if (!jwt) return;
    
    setAutoCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/billing/subscription/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Subscription created successfully!', 'success');
        fetchBillingData();
      } else if (data.message !== 'Subscription already exists') {
        showNotification(data.message || 'Failed to create subscription', 'error');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      showNotification('Failed to create subscription. Please try again.', 'error');
    } finally {
      setAutoCreating(false);
    }
  };

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
    if (!jwt) return;
    
    setSubmitting(true);
    console.log('Creating subscription with cycle:', billingCycle);

    try {
      const response = await fetch('http://localhost:8000/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ 
          plan: 'standard', 
          billing_cycle: billingCycle 
        })
      });

      console.log('Subscription response status:', response.status);

      const data = await response.json();
      console.log('Subscription response data:', data);

      if (data.success) {
        showNotification('Subscription created successfully!', 'success');
        fetchBillingData();
        setShowSubscribeModal(false);
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
        // Refresh user data to update businessInactive status
        if (refreshUser) {
          await refreshUser();
        }
        // Check if business is now active and redirect to dashboard
        setTimeout(() => {
          if (user && !user.businessInactive) {
            router.push('/dashboard');
          }
        }, 1500);
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

  const priceCalculation = calculatePrice(billingCycle);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your subscription, invoices, and payments</p>
        </div>
        {!subscription && (
          <button
            onClick={autoCreateSubscription}
            disabled={autoCreating}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {autoCreating ? 'Creating...' : 'Create Subscription'}
          </button>
        )}
      </div>

      {/* Inactive Business Warning Banner */}
      {user?.businessInactive && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                {user.subscriptionExpired ? 'Subscription Expired' : 
                 user.subscriptionPending ? 'Payment Pending' : 
                 'Business Inactive'}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {user.subscriptionExpired 
                  ? 'Your subscription has expired. Please renew your subscription to continue using the system.'
                  : user.subscriptionPending
                  ? 'Your subscription is pending payment. Please make a payment to activate your account.'
                  : 'Your business account is inactive. Please complete payment or contact support to activate your account.'
                }
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-red-600 font-medium">
                  Price: 100 ETB/day (Standard Plan)
                </span>
                <span className="text-red-500">
                  Including 15% VAT
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={async () => {
                    if (refreshUser) {
                      await refreshUser();
                      // Check if business is now active
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
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
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-gray-400" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
            <p className="text-gray-500 mb-6">Subscribe to access the full features of the system.</p>
            
            {/* Pricing Card */}
            <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Standard Plan</h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">100</span>
                <span className="text-gray-500">ETB/day</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Including 15% VAT</p>
              
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingCycle === 'yearly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-xs text-emerald-600">(Save 20%)</span>
                </button>
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-4">
                Total: {priceCalculation.total.toFixed(0)} ETB / {billingCycle === 'yearly' ? 'year' : 'month'}
              </div>

              <button
                onClick={handleCreateSubscription}
                disabled={submitting}
                className="w-full px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Subscribe Now'}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Important</p>
                  <p>Your business will be activated only after payment is verified. Please make a bank transfer after subscribing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {invoices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h2>
              <p className="text-gray-500 mb-4">Create a subscription to generate your first invoice.</p>
              {!subscription && (
                <button
                  onClick={autoCreateSubscription}
                  disabled={autoCreating}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  {autoCreating ? 'Creating...' : 'Create Subscription'}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="font-semibold text-gray-900">Invoices</h3>
                <button
                  onClick={() => {
                    fetchBillingData();
                    if (refreshUser) refreshUser();
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">#{invoice.invoice_number || invoice._id.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{invoice.plan}</p>
                        <p className="text-xs text-gray-500">{invoice.billing_cycle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{invoice.total} ETB</p>
                        <p className="text-xs text-gray-500">{invoice.days} days</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="px-3 py-1 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
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
        <div className="space-y-6">
          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-gray-400" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h2>
              <p className="text-gray-500">Payment history will appear here after you make a payment.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{new Date(payment.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{payment.amount} ETB</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{payment.bank_account?.bank_name}</p>
                        <p className="text-xs text-gray-500">{payment.bank_account?.account_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{payment.transaction_reference}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Submit Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {selectedInvoice && (
              <div className="p-6 bg-gray-50 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Invoice Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedInvoice.total} ETB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <select
                  required
                  value={paymentForm.bank_name}
                  onChange={(e) => {
                    const bank = bankAccounts.find(b => b.bank_name === e.target.value);
                    setPaymentForm(prev => ({
                      ...prev,
                      bank_name: e.target.value,
                      account_number: bank?.account_number || '',
                      account_name: bank?.account_name || ''
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select bank account</option>
                  {bankAccounts.map((bank) => (
                    <option key={bank._id} value={bank.bank_name}>
                      {bank.bank_name} - {bank.account_number} ({bank.account_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_reference: e.target.value }))}
                  placeholder="Enter your bank transaction reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.payer_name}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payer_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer Phone</label>
                  <input
                    type="tel"
                    required
                    value={paymentForm.payer_phone}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, payer_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payer Email (Optional)</label>
                <input
                  type="email"
                  value={paymentForm.payer_email}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payer_email: e.target.value }))}
                  placeholder="Enter your email (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
