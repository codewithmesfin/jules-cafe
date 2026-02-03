"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import {
  ShoppingBag, Calendar, Users, DollarSign,
  AlertTriangle, Package, TrendingUp, ChevronRight, Award,
  Clock, CheckCircle, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Order, User as UserType, Inventory, Product } from '../../types';
import Link from 'next/link';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<UserType[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [salesTrends, setSalesTrends] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordRes, userRes, invRes] = await Promise.all([
          api.orders.getAll(),
          api.users.getAll(),
          api.inventory.getAll(),
        ]);

        setOrders(Array.isArray(ordRes) ? ordRes : ordRes.data || []);
        setStaff((Array.isArray(userRes) ? userRes : userRes.data || []).filter((u: any) => ['waiter', 'cashier'].includes(u.role)));
        setInventory(Array.isArray(invRes) ? invRes : invRes.data || []);

        // Analytics
        const trends = await api.analytics.getSales('interval=daily&limit=7');
        const products = await api.analytics.getProducts('limit=5');

        setSalesTrends(Array.isArray(trends) ? trends : trends.data || []);
        setTopItems(Array.isArray(products) ? products : products.data || []);

      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        showNotification(error.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Generating Insights...</p>
    </div>
  );

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.order_status));
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total_amount, 0);
  const lowStockCount = inventory.filter(i => i.quantity_available <= i.reorder_level).length;

  return (
    <div className="space-y-10 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Business Intelligence</h1>
          <div className="flex items-center gap-2 mt-2">
             <Badge className="px-3 py-1 font-black rounded-lg bg-blue-600 border-none">LIVE OPS</Badge>
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               <Activity size={14} className="text-green-500" /> System Operational
             </p>
          </div>
        </div>
        <div className="flex gap-3">
           <Link href="/cashier/queue">
             <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black gap-2 h-14 px-8 shadow-xl">
               Live Order Queue <ChevronRight size={18} />
             </Button>
           </Link>
        </div>
      </div>

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Staff', value: staff.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Critical Stock', value: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400', bg: lowStockCount > 0 ? 'bg-rose-50' : 'bg-slate-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm bg-white p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-xl transition-all group border">
            <div className={cn("p-5 rounded-[1.5rem] transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-[2.5rem] p-8 bg-white border" title="Revenue Performance">
          <div className="h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="managerRev" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#managerRev)"
                  name="Daily Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="border-slate-100 shadow-sm rounded-[2.5rem] p-8 bg-white border" title="Bestselling Products">
          <div className="mt-8 space-y-8">
            {topItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-inner">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.count} Orders</p>
                    </div>
                  </div>
                  <span className="font-black text-blue-600">${item.revenue.toFixed(2)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.count / (topItems[0]?.count || 1)) * 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-blue-600 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                  />
                </div>
              </div>
            ))}
            {topItems.length === 0 && (
              <div className="text-center py-20 text-slate-300 italic">
                No product data available
              </div>
            )}
          </div>

          <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-blue-400">Monthly Target</p>
              <h4 className="text-2xl font-black mb-6">$50,000.00</h4>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              </div>
              <p className="mt-4 text-xs font-bold text-slate-400">67% of monthly goal reached</p>
            </div>
            <TrendingUp className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </Card>
      </div>

      {/* Staff and Inventory Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Personnel Activity" className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white p-8 border">
          <div className="mt-8 space-y-6">
            {staff.map((s, i) => {
              const assignedCount = orders.filter(o => o.creator_id === (s.id || s._id)).length;
              return (
                <div key={s.id || s._id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                         {s.full_name?.charAt(0)}
                       </div>
                       <div>
                         <span className="font-black text-slate-700 block leading-tight">{s.full_name}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.role}</span>
                       </div>
                    </div>
                    <Badge className="bg-slate-50 text-slate-500 border-none font-black text-[10px]">{assignedCount} orders</Badge>
                  </div>
                </div>
              );
            })}
            {staff.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No active personnel recorded.</p>}
          </div>
        </Card>

        <Card title="Inventory Health" className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white p-8 border">
          {lowStockCount > 0 ? (
            <div className="space-y-6 mt-6">
               <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-5">
                  <div className="p-4 bg-rose-600 text-white rounded-2xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-rose-600 uppercase tracking-widest text-xs">Stock Shortage</h4>
                    <p className="text-rose-500 text-sm font-bold">{lowStockCount} ingredients require immediate replenishment.</p>
                  </div>
               </div>
               <div className="space-y-4">
                 {inventory.filter(i => i.quantity_available <= i.reorder_level).slice(0, 3).map((item: any, idx) => (
                   <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700">{item.ingredient_id?.name || 'Unknown Ingredient'}</span>
                      <Badge variant="error" className="font-black text-[10px]">{item.quantity_available} {item.ingredient_id?.unit} left</Badge>
                   </div>
                 ))}
               </div>
               <Link href="/manager/inventory" className="block">
                 <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black hover:bg-slate-50 text-slate-600">
                   Manage Inventory
                 </Button>
               </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
               <div className="p-6 bg-green-50 text-green-600 rounded-full">
                 <CheckCircle size={48} />
               </div>
               <div>
                 <h4 className="font-black text-slate-900">Inventory Secure</h4>
                 <p className="text-slate-500 text-sm font-medium">All ingredients are above safety stock levels.</p>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
