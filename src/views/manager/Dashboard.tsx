"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import {
  ShoppingBag, Calendar, Users, DollarSign,
  AlertTriangle, Package, TrendingUp, ChevronRight, Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Order, Reservation, User as UserType, InventoryItem } from '../../types';
import Link from 'next/link';

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<UserType[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [salesTrends, setSalesTrends] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Basic stats
        const [ordData, resData, userData, invData] = await Promise.all([
          api.orders.getAll(),
          api.reservations.getAll(),
          api.users.getAll(),
          api.inventory.getAll(),
        ]);

        setOrders(ordData);
        setReservations(resData);
        setStaff(userData.filter((u: any) => u.role === 'staff'));
        setInventory(invData);

        // Advanced Analytics for this branch
        const analyticsParams = new URLSearchParams({
          interval: 'daily',
          limit: '5'
        }).toString();

        const [trends, products] = await Promise.all([
          api.stats.getSales(analyticsParams),
          api.stats.getProducts(analyticsParams)
        ]);

        setSalesTrends(trends);
        setTopItems(products);

      } catch (error: any) {
        console.error('Failed to fetch manager dashboard data:', error);
        showNotification(error.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.branch_id) {
      fetchData();
    }
  }, [user?.branch_id]);

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Assigned</h2>
        <p className="text-gray-500 text-center max-w-md">
          This manager account is not yet associated with any branch.
          Please contact an administrator to assign you to a branch.
        </p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Analytics loading...</p>
    </div>
  );

  const lowStockItems = inventory.filter(i => i.quantity <= i.min_stock);
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-10 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Branch Command Center</h1>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant="info" className="px-3 py-1 font-black rounded-lg">LIVE MONITOR</Badge>
             <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Branch ID: {user?.branch_id}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Link href="/manager/orders">
             <Button variant="outline" className="rounded-2xl border-gray-200 font-black gap-2 h-12">
               Live Queue <ChevronRight size={18} />
             </Button>
           </Link>
        </div>
      </div>

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Bookings', value: reservations.filter(r => r.status === 'requested').length, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Staff', value: staff.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white p-6 rounded-3xl flex items-center gap-5 hover:shadow-xl transition-shadow group">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Critical Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-none bg-red-600 text-white p-6 rounded-3xl shadow-2xl shadow-red-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="p-4 bg-white/20 rounded-2xl">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Stock Emergency</h3>
                <p className="text-red-100 font-medium">{lowStockItems.length} items have fallen below minimum safety levels.</p>
              </div>
            </div>
            <Link href="/manager/inventory">
              <Button className="bg-white text-red-600 hover:bg-red-50 font-black px-8 py-6 rounded-2xl shadow-xl">
                REPLENISH NOW
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] p-8 bg-white" title="7-Day Performance Trend">
          <div className="h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="managerRev" x1="0" y1="0" x2="0" y2="1">
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
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="total_revenue"
                  stroke="#ea580c"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#managerRev)"
                  name="Daily Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products - Visual */}
        <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white" title="Top Selling Menus">
          <div className="mt-8 space-y-8">
            {topItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center font-black text-orange-600">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.total_sold} Sold</p>
                    </div>
                  </div>
                  <span className="font-black text-orange-600">ETB {item.total_revenue.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.total_sold / (topItems[0]?.total_sold || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.3)]"
                  />
                </div>
              </div>
            ))}
            {topItems.length === 0 && <p className="text-center text-gray-400 italic py-10 font-medium">No sales data recorded yet.</p>}
          </div>

          <div className="mt-12 p-6 bg-orange-600 rounded-3xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Shift Goal</p>
              <h4 className="text-2xl font-black mb-4">Target: ETB 500,000</h4>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-white rounded-full" />
              </div>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </Card>
      </div>

      {/* Staff and Reservations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Staff Workload Distribution" className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <div className="mt-8 space-y-6">
            {staff.map((s, i) => {
              const assignedCount = orders.filter(o => o.waiter_id === s.id).length;
              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                       <img src={`https://i.pravatar.cc/150?u=${s.username}`} className="w-8 h-8 rounded-full" alt="staff" />
                       <span className="font-black text-gray-700">{s.full_name}</span>
                    </div>
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{assignedCount} active</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", COLORS[i % COLORS.length])}
                      style={{ width: `${Math.min(100, (assignedCount / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {staff.length === 0 && <p className="text-center text-gray-500 text-sm">No staff assigned to this branch.</p>}
          </div>
        </Card>

        <Card title="Reservation Status Map" className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <div className="flex items-center justify-center h-48 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center text-3xl font-black text-orange-600 mb-3 shadow-inner">
                {reservations.filter(r => r.status === 'confirmed').length}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmed</div>
            </div>
            <div className="w-px h-16 bg-gray-100" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-3xl font-black text-blue-600 mb-3 shadow-inner">
                {reservations.filter(r => r.status === 'requested').length}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested</div>
            </div>
            <div className="w-px h-16 bg-gray-100" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-3xl font-black text-red-600 mb-3 shadow-inner">
                {reservations.filter(r => r.status === 'cancelled').length}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancelled</div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-900 rounded-3xl flex items-center justify-between">
             <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Upcoming Capacity</p>
                <p className="text-xl font-black text-white">85% Occupied</p>
             </div>
             <Calendar className="text-orange-600 w-8 h-8" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
