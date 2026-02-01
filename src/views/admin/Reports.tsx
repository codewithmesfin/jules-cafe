"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ShoppingBag, TrendingUp, DollarSign, Calendar, Filter,
  ChevronDown, Download, RefreshCcw, MapPin, Package, Award
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../utils/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import type { Branch } from '../../types';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    fetchFilters();
    fetchAllAnalytics();
  }, []);

  const fetchFilters = async () => {
    try {
      const brs = await api.branches.getAll();
      setBranches(brs);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
        interval: interval
      });
      if (selectedBranch !== 'all') params.append('branch_id', selectedBranch);

      const [sales, products, branchPerf, stock] = await Promise.all([
        api.stats.getSales(params.toString()),
        api.stats.getProducts(params.toString()),
        api.stats.getBranches(params.toString()),
        api.stats.getStock(params.toString())
      ]);

      setSalesData(sales);
      setProductData(products);
      setBranchData(branchPerf);
      setStockData(stock);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.total_revenue, 0);
  const totalOrders = salesData.reduce((acc, curr) => acc + curr.order_count, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleQuickFilter = (type: string) => {
    const today = new Date();
    let start = subDays(today, 30);
    let end = today;

    if (type === 'today') start = today;
    if (type === 'week') start = subDays(today, 7);
    if (type === 'month') {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }
    if (type === 'year') {
      start = startOfYear(today);
      end = endOfYear(today);
    }

    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Main Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Intelligence</h1>
          <p className="text-gray-500 font-medium">Comprehensive performance tracking and trends analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {['today', 'week', 'month', 'year'].map((t) => (
              <button
                key={t}
                onClick={() => handleQuickFilter(t)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-50"
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={fetchAllAnalytics}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Update Report
          </Button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Context</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-sm font-bold"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Global Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
            <Input
              type="date"
              className="bg-gray-50 border-gray-200 rounded-xl font-bold"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
            <Input
              type="date"
              className="bg-gray-50 border-gray-200 rounded-xl font-bold"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aggregation</label>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-sm font-bold"
              value={interval}
              onChange={(e) => setInterval(e.target.value as any)}
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly Trends</option>
              <option value="monthly">Monthly Overview</option>
              <option value="yearly">Yearly Performance</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Order Volume', value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Items', value: productData.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white p-6 rounded-3xl flex items-center gap-5">
            <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <Card className="border-none shadow-sm rounded-3xl p-8 bg-white" title="Revenue & Order Trends">
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#1e293b' }}
                />
                <Area
                  type="monotone"
                  dataKey="total_revenue"
                  stroke="#ea580c"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Branch Performance Chart */}
        <Card className="border-none shadow-sm rounded-3xl p-8 bg-white" title="Branch Performance Ranking">
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="branch_name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 800, fill: '#1e293b' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="total_revenue"
                  fill="#ea580c"
                  radius={[0, 10, 10, 0]}
                  barSize={24}
                  name="Total Revenue ($)"
                >
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products Table/List */}
        <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white" title="Top Selling Items">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Award className="text-orange-500" size={24} />
              Bestsellers
            </h3>
            <Badge variant="info" className="font-black">Top {productData.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity Sold</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productData.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-black text-gray-900">{item.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-gray-600">{item.total_sold} units</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-orange-600">${item.total_revenue.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="w-24 h-1.5 bg-gray-100 rounded-full inline-block overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${(item.total_sold / (productData[0]?.total_sold || 1)) * 100}%` }}
                          />
                       </div>
                    </td>
                  </tr>
                ))}
                {productData.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-medium italic">No sales data for this period</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stock/Consumption Summary */}
        <Card className="border-none shadow-sm rounded-3xl p-8 bg-white" title="Stock Movement Analysis">
          <div className="h-[300px] mt-6 flex flex-col md:flex-row items-center justify-center gap-12">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="entry_count"
                  nameKey="_id"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full md:w-64 space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Purchases</p>
                <p className="text-xl font-black text-blue-900">
                  {stockData.find(s => s._id === 'purchase')?.entry_count || 0} entries
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Sales (Consumption)</p>
                <p className="text-xl font-black text-orange-900">
                  {stockData.find(s => s._id === 'sale')?.entry_count || 0} entries
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Waste</p>
                <p className="text-xl font-black text-red-900">
                  {stockData.find(s => s._id === 'waste')?.entry_count || 0} entries
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
      `}</style>
    </div>
  );
};

export default Reports;
