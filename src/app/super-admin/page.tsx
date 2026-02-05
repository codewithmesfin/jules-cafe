"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';
import {
  Users,
  Building2,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
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

// Types for API responses
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

interface DashboardStats {
  totalAdmins: number;
  activeBusinesses: number;
  monthlyRevenue: number;
  pendingInvoices: number;
}

interface RecentAdmin {
  id: string;
  full_name: string;
  email: string;
  business_count: number;
  status: string;
  created_at: string;
}

interface RecentBusiness {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: string;
  revenue: number;
}

export default function SuperAdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAdmins: 0,
    activeBusinesses: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0
  });
  const [recentAdmins, setRecentAdmins] = useState<RecentAdmin[]>([]);
  const [recentBusinesses, setRecentBusinesses] = useState<RecentBusiness[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admins
      const adminsResponse = await api.saasAdmin.getAdmins();
      // Handle both { data: [...] } and [...] response formats
      const admins: AdminUser[] = Array.isArray(adminsResponse) ? adminsResponse : (adminsResponse.data || adminsResponse);
      
      // Fetch businesses
      const businessesResponse = await api.saasAdmin.getBusinesses();
      const businesses = Array.isArray(businessesResponse) ? businessesResponse : (businessesResponse.data || businessesResponse);
      
      // Fetch invoices
      const invoicesResponse = await api.saasAdmin.getInvoices();
      const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : (invoicesResponse.data || invoicesResponse);

      // Calculate stats
      setStats({
        totalAdmins: admins.length,
        activeBusinesses: businesses.filter((b: any) => b.is_active).length,
        monthlyRevenue: businesses.reduce((sum: number, b: any) => sum + (b.subscription_amount || 0), 0),
        pendingInvoices: invoices.filter((i: any) => i.status === 'sent' || i.status === 'draft').length
      });

      // Transform admins for table
      const transformedAdmins: RecentAdmin[] = admins.map(admin => ({
        id: admin.id,
        full_name: admin.fullName || 'Unknown',
        email: admin.email,
        business_count: admin.businesses?.length || 0,
        status: admin.status,
        created_at: admin.createdAt
      }));
      setRecentAdmins(transformedAdmins.slice(0, 5));

      // Transform businesses for table
      const transformedBusinesses: RecentBusiness[] = businesses.map((biz: any) => ({
        id: biz._id,
        name: biz.name,
        owner: biz.owner_name || 'Unknown',
        plan: biz.subscription_plan || 'starter',
        status: biz.is_active ? 'active' : 'inactive',
        revenue: biz.subscription_amount || 0
      }));
      setRecentBusinesses(transformedBusinesses.slice(0, 5));

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Admins',
      value: stats.totalAdmins.toString(),
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Businesses',
      value: stats.activeBusinesses.toString(),
      change: '+0%',
      trend: 'up',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices.toString(),
      change: '-0%',
      trend: 'down',
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admins */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Admins</h2>
            <a href="/super-admin/admins" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </a>
          </div>
          {recentAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Admin</th>
                    <th className="pb-3">Businesses</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {admin.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {admin.full_name}
                            </p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {admin.business_count}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            admin.status === 'active'
                              ? 'success'
                              : admin.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {formatDate(admin.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Businesses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Businesses</h2>
            <a href="/super-admin/businesses" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </a>
          </div>
          {recentBusinesses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No businesses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Business</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Revenue</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500">{business.owner}</p>
                      </td>
                      <td className="py-3">
                        <Badge variant="primary">{business.plan}</Badge>
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-900">
                        ${business.revenue.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {business.status === 'active' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">Active</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
