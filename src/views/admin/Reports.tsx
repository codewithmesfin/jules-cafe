"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  ShoppingBag, TrendingUp, DollarSign, Calendar, Filter,
  ChevronDown, Download, RefreshCcw, Package, Award, Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../utils/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
        interval: interval
      }).toString();

      const [sales, products, stock] = await Promise.all([
        api.analytics.getSales(params),
        api.analytics.getProducts(params),
        api.analytics.getStock(params)
      ]);

      setSalesData(Array.isArray(sales) ? sales : sales.data || []);
      setProductData(Array.isArray(products) ? products : products.data || []);
      setStockData(Array.isArray(stock) ? stock : stock.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = salesData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalOrders = salesData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleQuickFilter = (type: string) => {
    const today = new Date();
    let start = subDays(today, 30);
    let end = today;

    if (type === 'today') {
      start = today;
      end = today;
    }
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
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Intelligence</h1>
          <p className="text-slate-500 font-medium">Extract deep insights from your business operations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {['today', 'week', 'month', 'year'].map((t) => (
              <button
                key={t}
                onClick={() => handleQuickFilter(t)}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:bg-white text-slate-500 hover:text-blue-600"
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            className="h-12 rounded-2xl gap-2 shadow-lg shadow-blue-100 font-black"
            onClick={fetchAllAnalytics}
            disabled={loading}
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <Card className="p-6 border-slate-100 shadow-sm bg-white rounded-[2rem] border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
            <Input
              type="date"
              className="bg-slate-50 border-slate-100 rounded-xl font-bold h-12"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
            <Input
              type="date"
              className="bg-slate-50 border-slate-100 rounded-xl font-bold h-12"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aggregation Level</label>
            <select
              className="w-full px-4 h-12 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-bold text-slate-700"
              value={interval}
              onChange={(e) => setInterval(e.target.value as any)}
            >
              <option value="daily">Daily Resolution</option>
              <option value="weekly">Weekly Rollup</option>
              <option value="monthly">Monthly Aggregate</option>
              <option value="yearly">Yearly Overview</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Transactions', value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Ticket Average', value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Menu Strength', value: productData.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm bg-white p-8 rounded-[2rem] flex items-center gap-6 border">
            <div className={cn("p-5 rounded-[1.5rem]", stat.bg, stat.color)}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <Card className="border-slate-100 shadow-sm rounded-[2.5rem] p-8 bg-white border" title="Growth Analytics">
          <div className="h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#3b82f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Product Distribution Chart */}
        <Card className="border-slate-100 shadow-sm rounded-[2.5rem] p-8 bg-white border" title="Revenue Share by Product">
          <div className="h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData.slice(0, 7)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="name"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products Detailed List */}
        <Card className="border-slate-100 shadow-sm rounded-[2.5rem] p-0 overflow-hidden bg-white border lg:col-span-2" title="Inventory Performance Matrix">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Activity className="text-blue-600" size={24} />
              Product Performance Ranking
            </h3>
            <Badge className="bg-blue-600 border-none font-black px-4 py-1.5 rounded-xl">Operational Data</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Asset</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Units Transacted</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated Revenue</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Market Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productData.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <span className="font-black text-slate-900">{item.name}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-xs">{item.count} Sold</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-black text-blue-600">${item.revenue.toFixed(2)}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="w-32 h-2 bg-slate-100 rounded-full inline-block overflow-hidden relative">
                          <div
                            className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                            style={{ width: `${Math.min(100, (item.count / (productData[0]?.count || 1)) * 100)}%` }}
                          />
                       </div>
                    </td>
                  </tr>
                ))}
                {productData.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-10 py-24 text-center text-slate-300 font-bold italic">Insufficient data for reporting period</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: grayscale(1) opacity(0.5);
        }
      `}</style>
    </div>
  );
};

export default Reports;
