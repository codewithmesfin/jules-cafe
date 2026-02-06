"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, ChefHat, BarChart3, Download, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

// Mock formatCurrency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
};

interface KPIMetric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'emerald' | 'rose' | 'blue' | 'amber';
}

const StatCard: React.FC<KPIMetric> = ({ label, value, change, icon, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  const iconBgClasses = {
    emerald: 'bg-emerald-100',
    rose: 'bg-rose-100',
    blue: 'bg-blue-100',
    amber: 'bg-amber-100',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              change >= 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(change)}% vs last period</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgClasses[color])}>
          <div className={colorClasses[color]}>{icon}</div>
        </div>
      </div>
    </Card>
  );
};

export default function ReportsPage() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrder: 0,
    topProducts: [] as any[],
    recentOrders: [] as any[],
    orderTrends: [] as any[]
  });

  useEffect(() => { fetchStats(); }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = `period=${period}`;
      
      // Fetch analytics data from API
      const [salesData, productsData] = await Promise.all([
        api.analytics.getSales(params),
        api.analytics.getProducts(params)
      ]);
      
      // Transform API data to stats format
      const revenue = salesData?.totalRevenue || 0;
      const orders = salesData?.totalOrders || 0;
      const customers = salesData?.totalCustomers || 0;
      const avgOrder = orders > 0 ? revenue / orders : 0;
      
      const topProducts = (productsData?.products || []).slice(0, 5).map((p: any) => ({
        name: p.name,
        quantity: p.totalSold || 0,
        revenue: p.totalRevenue || 0
      }));
      
      setStats({
        revenue,
        orders,
        customers,
        avgOrder,
        topProducts,
        recentOrders: (salesData?.recentOrders || []).map((o: any) => ({
          id: o.id,
          number: o.order_number || `ORD-${o.id}`,
          customer: { name: o.customer_name || 'Guest' },
          items: o.item_count || 0,
          total: o.total,
          status: o.status
        })),
        orderTrends: salesData?.trends || []
      });
    } catch (error) {
      showNotification('Failed to fetch analytics', 'error');
      // Fallback to empty data
      setStats({
        revenue: 0,
        orders: 0,
        customers: 0,
        avgOrder: 0,
        topProducts: [],
        recentOrders: [],
        orderTrends: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm">Track your business performance</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-40">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 appearance-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          change={12}
          icon={<DollarSign size={24} />}
          color="emerald"
        />
        <StatCard
          label="Orders"
          value={stats.orders}
          change={8}
          icon={<ShoppingCart size={24} />}
          color="blue"
        />
        <StatCard
          label="Customers"
          value={stats.customers}
          change={-3}
          icon={<Users size={24} />}
          color="amber"
        />
        <StatCard
          label="Avg. Order"
          value={formatCurrency(stats.avgOrder)}
          change={5}
          icon={<BarChart3 size={24} />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card title="Top Products" subtitle="Best sellers this period">
          <div className="space-y-4">
            {stats.topProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ChefHat size={32} className="mx-auto mb-2 opacity-50" />
                <p>No sales data yet</p>
              </div>
            ) : (
              stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card title="Recent Orders" subtitle="Latest transactions">
          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600">
                      #{order.number?.slice(-4) || '0000'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{order.customer?.name || 'Walk-in'}</p>
                      <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 text-sm">{formatCurrency(order.total)}</p>
                    <Badge 
                      variant={order.status === 'completed' ? 'success' : order.status === 'preparing' ? 'warning' : order.status === 'ready' ? 'info' : 'neutral'} 
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Order Trends Chart Placeholder */}
      <Card title="Order Trends" subtitle="Orders over time">
        <div className="h-48 sm:h-64 bg-slate-50 rounded-xl flex items-center justify-center">
          <div className="text-center text-slate-400">
            <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
            <p>Chart visualization</p>
            <p className="text-sm">Connect to a chart library for data</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
