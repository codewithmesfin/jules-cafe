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
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
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

interface Business {
  _id: string;
  name: string;
  legal_name?: string;
  owner_id: string;
  owner_name?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_amount?: number;
  payment_status?: string;
  is_active: boolean;
  address?: string;
  created_at: string;
  subscription_end?: string;
}

export default function SuperAdminBusinessesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.saasAdmin.getBusinesses();
      // Handle both { data: [...] } and [...] response formats
      const businessesData = Array.isArray(response) ? response : (response.data || response);
      setBusinesses(businessesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleToggleStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      setActionLoading(businessId);
      await api.saasAdmin.toggleBusinessStatus(businessId);
      // Refresh the list
      fetchBusinesses();
      if (selectedBusiness?._id === businessId) {
        setSelectedBusiness({ ...selectedBusiness, is_active: !currentStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && business.is_active) ||
      (statusFilter === 'inactive' && !business.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = businesses.reduce((sum, b) => sum + (b.subscription_amount || 0), 0);
  const totalOrders = businesses.reduce((sum, b) => sum + 0, 0); // Orders not available in current API
  const activeBusinesses = businesses.filter((b) => b.is_active).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-gray-500 mt-1">
            Manage all registered businesses on your platform.
          </p>
        </div>
        <Button onClick={fetchBusinesses}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Businesses</p>
              <p className="text-xl font-bold text-gray-900">{businesses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{activeBusinesses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-xl font-bold text-gray-900">
                {businesses.length - activeBusinesses}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load businesses</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchBusinesses}>Try Again</Button>
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
                  placeholder="Search businesses..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Businesses table */}
      {!error && (
        <Card className="overflow-hidden">
          {filteredBusinesses.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No businesses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBusinesses.map((business) => (
                    <tr key={business._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {business.name}
                            </p>
                            <p className="text-xs text-gray-500">{business.legal_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{business.owner_name || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary">
                          {business.subscription_plan || 'starter'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={business.is_active ? 'success' : 'error'}>
                          {business.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${(business.subscription_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {business.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBusiness(business);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(business._id, business.is_active)}
                            disabled={actionLoading === business._id}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Toggle Status"
                          >
                            {actionLoading === business._id ? (
                              <div className="w-4 h-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full" />
                            ) : (
                              <RefreshCw className="w-4 h-4 text-gray-400" />
                            )}
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

      {/* Business Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Business Details"
      >
        {selectedBusiness && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedBusiness.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedBusiness.legal_name}</p>
                <Badge variant={selectedBusiness.is_active ? 'success' : 'error'} className="mt-1">
                  {selectedBusiness.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedBusiness.owner_name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <Badge variant="primary">
                  {selectedBusiness.subscription_plan || 'starter'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-sm font-medium text-gray-900">
                  ${(selectedBusiness.subscription_amount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedBusiness.address || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedBusiness.created_at, 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription End</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedBusiness.subscription_end, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
