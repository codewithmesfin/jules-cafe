"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/utils/api';
import {
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Building2,
  RefreshCw,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Smartphone,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatStr);
  } catch {
    return 'N/A';
  }
};

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber?: string;
  businessName: string;
  businessId: string;
  amount: number;
  paymentMethod?: string;
  status: string;
  paymentDate?: string;
  bankAccount?: string;
  reference?: string;
}

export default function SuperAdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.saasAdmin.getPendingPayments();
      // Handle both { data: [...] } and [...] response formats
      const paymentsData = Array.isArray(response) ? response : (response.data || response);
      setPayments(paymentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      await api.saasAdmin.verifyPayment(paymentId, status);
      // Refresh the list and close modal
      fetchPayments();
      setShowDetailsModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment.paymentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalReceived = payments
    .filter((p) => p.status === 'verified' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const rejectedPayments = payments
    .filter((p) => p.status === 'rejected')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">
            Track and verify payments from businesses.
          </p>
        </div>
        <Button onClick={fetchPayments}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-xl font-bold text-gray-900">
                ${totalReceived.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                ${pendingPayments.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-xl font-bold text-gray-900">
                ${rejectedPayments.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load payments</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchPayments}>Try Again</Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      {!error && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Payments table */}
      {!error && (
        <Card className="overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {payment.status === 'verified' || payment.status === 'completed' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-orange-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {payment.paymentNumber || 'PAY-' + payment.id.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.businessName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm text-gray-600 capitalize">
                            {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            payment.status === 'verified' || payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Payment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPayment.paymentNumber || 'PAY-' + selectedPayment.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">{selectedPayment.businessName}</p>
              </div>
              <Badge
                variant={
                  selectedPayment.status === 'verified' || selectedPayment.status === 'completed'
                    ? 'success'
                    : selectedPayment.status === 'pending'
                    ? 'warning'
                    : 'error'
                }
              >
                {selectedPayment.status}
              </Badge>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${selectedPayment.amount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Business</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPayment.businessName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {selectedPayment.paymentMethod?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank/Provider</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPayment.bankAccount || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPayment.reference || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedPayment.paymentDate, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            {selectedPayment.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
