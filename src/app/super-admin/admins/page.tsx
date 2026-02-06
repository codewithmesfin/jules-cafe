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
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Edit
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

// Types
interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  businesses: BusinessDetail[];
}

interface BusinessDetail {
  id: string;
  name: string;
  plan: string;
  subscriptionStatus: string;
  location?: string;
}

export default function SuperAdminAdminsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.saasAdmin.getAdmins();
      // Handle both { data: [...] } and [...] response formats
      const adminsData = Array.isArray(response) ? response : (response.data || response);
      setAdmins(adminsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleToggleStatus = async (adminId: string, currentStatus: string) => {
    try {
      setActionLoading(adminId);
      await api.saasAdmin.toggleAdminStatus(adminId);
      // Refresh the list
      fetchAdmins();
      if (selectedAdmin?.id === adminId) {
        setSelectedAdmin({ ...selectedAdmin, status: currentStatus === 'active' ? 'inactive' : 'active' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenStatusModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedAdmin) return;
    
    try {
      setActionLoading(selectedAdmin.id);
      await api.saasAdmin.setAdminStatus(selectedAdmin.id, selectedAdmin.status);
      // Refresh the list
      fetchAdmins();
      setShowStatusModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      (admin.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const pendingAdmins = admins.filter((a) => a.status === 'pending').length;
  const inactiveAdmins = admins.filter((a) => a.status === 'inactive' || a.status === 'suspended').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            Manage all admin accounts and their businesses.
          </p>
        </div>
        <Button onClick={fetchAdmins}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Admins</p>
              <p className="text-xl font-bold text-gray-900">{admins.length}</p>
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
              <p className="text-xl font-bold text-gray-900">{activeAdmins}</p>
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
              <p className="text-xl font-bold text-gray-900">{pendingAdmins}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive/Suspended</p>
              <p className="text-xl font-bold text-gray-900">{inactiveAdmins}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load admins</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchAdmins}>Try Again</Button>
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
                  placeholder="Search admins..."
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
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Admins table */}
      {!error && (
        <Card className="overflow-hidden">
          {filteredAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Businesses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {(admin.fullName || 'U').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {admin.fullName || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {admin.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {admin.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {admin.businesses?.length || 0} business{(admin.businesses?.length || 0) !== 1 ? 'es' : ''}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {admin.businesses?.slice(0, 2).map((b) => b.name).join(', ') || 'No businesses'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            admin.status === 'active'
                              ? 'success'
                              : admin.status === 'pending'
                              ? 'warning'
                              : admin.status === 'suspended'
                              ? 'error'
                              : 'neutral'
                          }
                        >
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(admin.lastLogin)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(admin.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(admin)}
                            disabled={actionLoading === admin.id}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Toggle Status"
                          >
                            {actionLoading === admin.id ? (
                              <div className="w-4 h-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full" />
                            ) : (
                              <Edit className="w-4 h-4 text-gray-400" />
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

      {/* Admin Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Admin Details"
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">
                  {(selectedAdmin.fullName || 'U').charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAdmin.fullName || 'Unknown'}
                </h3>
                <Badge
                  variant={
                    selectedAdmin.status === 'active'
                      ? 'success'
                      : selectedAdmin.status === 'pending'
                      ? 'warning'
                      : 'error'
                  }
                >
                  {selectedAdmin.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAdmin.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAdmin.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Businesses</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAdmin.businesses?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedAdmin.createdAt, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            {selectedAdmin.businesses && selectedAdmin.businesses.length > 0 && (
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-2">Businesses</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAdmin.businesses.map((business) => (
                    <Badge key={business.id} variant="primary">
                      {business.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Edit Admin Status"
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin: {selectedAdmin.fullName}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email: {selectedAdmin.email}
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedAdmin.status}
                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {selectedAdmin.status === 'inactive' || selectedAdmin.status === 'suspended' ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                ⚠️ Selecting "Inactive" or "Suspended" will prevent this admin from accessing the system.
              </p>
            ) : selectedAdmin.status === 'active' ? (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                ✓ Selecting "Active" will restore this admin's access to the system.
              </p>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                The admin's access is pending review.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowStatusModal(false)}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmStatusChange}
                disabled={actionLoading !== null}
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
