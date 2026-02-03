"use client";
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, CreditCard } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../utils/api';

const Finances: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.orders.getAll();
        setOrders(Array.isArray(response) ? response : response.data || []);
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const paidRevenue = orders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + (o.total_amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
        <p className="text-slate-500 font-medium">Monitor your revenue, payments, and business cash flow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Collected Cash', value: `$${paidRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Outstanding', value: `$${(totalRevenue - paidRevenue).toLocaleString()}`, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-slate-100 rounded-[2rem] flex items-center gap-6 shadow-sm border bg-white">
            <div className={cn("p-5 rounded-2xl", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-slate-100 rounded-[2.5rem] bg-white border p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-8">Recent Transactions</h3>
        <div className="space-y-6">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id || order._id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Order #{(order.id || order._id)?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-slate-400 font-bold">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900">${order.total_amount.toFixed(2)}</p>
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 mt-1">
                  {order.payment_status}
                </Badge>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic">No transactions found</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Helper for cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Finances;
