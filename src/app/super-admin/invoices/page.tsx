"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/utils/api';
import {
  Search,
  Eye,
  Download,
  Send,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  businessName: string;
  businessId: string;
  adminName?: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
}

export default function SuperAdminInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.saasAdmin.getInvoices();
      // Handle both { data: [...] } and [...] response formats
      const invoicesData = Array.isArray(response) ? response : (response.data || response);
      setInvoices(invoicesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter((inv) => ['sent', 'draft'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            Manage all invoices for businesses on your platform.
          </p>
        </div>
        <Button onClick={fetchInvoices}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-xl font-bold text-gray-900">
                ${paidAmount.toLocaleString()}
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
                ${pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-gray-900">
                ${overdueAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load invoices</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchInvoices}>Try Again</Button>
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
                  placeholder="Search invoices..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Invoices table */}
      {!error && (
        <Card className="overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{invoice.businessName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${invoice.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            (${invoice.amount} + ${invoice.vatAmount} VAT)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'sent'
                              ? 'info'
                              : invoice.status === 'overdue'
                              ? 'error'
                              : invoice.status === 'draft'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          {invoice.status === 'draft' && (
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Send"
                            >
                              <Send className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
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

      {/* Invoice Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Invoice Details"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-sm text-gray-500">{selectedInvoice.businessName}</p>
              </div>
              <Badge
                variant={
                  selectedInvoice.status === 'paid'
                    ? 'success'
                    : selectedInvoice.status === 'sent'
                    ? 'info'
                    : selectedInvoice.status === 'overdue'
                    ? 'error'
                    : selectedInvoice.status === 'draft'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {selectedInvoice.status}
              </Badge>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${selectedInvoice.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">VAT (15%)</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${selectedInvoice.vatAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">
                    ${selectedInvoice.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Invoice Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedInvoice.invoiceDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedInvoice.dueDate, 'MMMM d, yyyy')}
                </p>
              </div>
              {selectedInvoice.paymentDate && (
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedInvoice.paymentDate, 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
