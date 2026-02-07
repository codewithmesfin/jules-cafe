"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  branch?: string;
}

const bankAccounts: BankAccount[] = [
  {
    bankName: 'Commercial Bank of Ethiopia',
    accountName: 'Mevin Cafe SaaS Services',
    accountNumber: '1001234567890',
    branch: 'Head Office',
  },
  {
    bankName: 'Awash Bank',
    accountName: 'Mevin Cafe SaaS Services',
    accountNumber: '0132345678901',
    branch: 'Bole Branch',
  },
];

const InvoicePage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  // Sample invoice data
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);

  const planName = 'Professional Plan';
  const billingPeriod = 'Monthly';

  const items: InvoiceItem[] = [
    {
      description: `SaaS Subscription - ${planName}`,
      quantity: 1,
      unitPrice: 599,
      total: 599,
    },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.15;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  const handlePaymentSubmit = async () => {
    if (!selectedBank) return;
    setIsSubmitting(true);
    
    // Simulate payment submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setPaymentSubmitted(true);
  };

  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <Card padding="comfortable" className="text-center">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Payment Submitted Successfully!
              </h2>
              <p className="text-slate-600 mb-6">
                Thank you for your payment. Our team will verify your payment within 24 hours
                and activate your subscription. You will receive a confirmation email once
                your payment is processed.
              </p>
              <div className="bg-slate-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">
                  Invoice Number: <span className="font-semibold">{invoiceNumber}</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Amount Paid: <span className="font-semibold">ETB {grandTotal.toLocaleString()}</span>
                </p>
              </div>
              <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Invoice Header */}
          <Card padding="comfortable" className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                <p className="text-slate-500 mt-1">{invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Invoice Date</p>
                <p className="font-semibold text-slate-900">
                  {format(invoiceDate, 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-slate-500 mt-1">Due Date</p>
                <p className="font-semibold text-slate-900">
                  {format(dueDate, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bill To */}
              <Card padding="comfortable">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">Your Business Name</p>
                  <p className="text-slate-600">123 Main Street</p>
                  <p className="text-slate-600">Addis Ababa, Ethiopia</p>
                  <p className="text-slate-600">info@yourbusiness.com</p>
                </div>
              </Card>

              {/* Invoice Items */}
              <Card padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                          Description
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                          Qty
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                          Unit Price
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{item.description}</p>
                            <p className="text-sm text-slate-500">{billingPeriod}</p>
                          </td>
                          <td className="text-right px-6 py-4 text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="text-right px-6 py-4 text-slate-600">
                            ETB {item.unitPrice.toLocaleString()}
                          </td>
                          <td className="text-right px-6 py-4 font-medium text-slate-900">
                            ETB {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-200 p-6">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>VAT (15%)</span>
                        <span>ETB {vatAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                        <span>Total</span>
                        <span>ETB {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Proof Upload */}
              <Card padding="comfortable">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Upload Payment Proof
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  After making the payment, please upload your payment receipt or screenshot
                  to help us process your payment faster.
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPaymentProof(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label htmlFor="payment-proof" className="cursor-pointer">
                    {paymentProof ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-6 h-6 text-success-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-success-600 font-medium">
                          {paymentProof.name}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="w-10 h-10 text-slate-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-slate-600">
                          Click to upload payment receipt
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Supported: JPG, PNG, PDF
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </Card>
            </div>

            {/* Payment Instructions */}
            <div className="lg:col-span-1">
              <Card padding="comfortable" className="sticky top-24">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Payment Instructions
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Please make your payment to one of the bank accounts below. Your
                  subscription will be activated after payment verification.
                </p>

                <div className="space-y-4 mb-6">
                  {bankAccounts.map((bank, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBank?.accountNumber === bank.accountNumber
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedBank(bank)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedBank?.accountNumber === bank.accountNumber
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-slate-300'
                        }`} />
                        <span className="font-semibold text-slate-900">
                          {bank.bankName}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-600">
                          <span className="text-slate-400">Account Name:</span>{' '}
                          {bank.accountName}
                        </p>
                        <p className="text-slate-600">
                          <span className="text-slate-400">Account No:</span>{' '}
                          {bank.accountNumber}
                        </p>
                        {bank.branch && (
                          <p className="text-slate-600">
                            <span className="text-slate-400">Branch:</span>{' '}
                            {bank.branch}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-2">
                    <svg
                      className="w-5 h-5 text-warning-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-warning-800">
                        Important
                      </p>
                      <p className="text-xs text-warning-700 mt-1">
                        Use the invoice number ({invoiceNumber}) as your payment reference.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!selectedBank}
                  onClick={handlePaymentSubmit}
                >
                  Submit Payment
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2024 Mevin Cafe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default InvoicePage;
