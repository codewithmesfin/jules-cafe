"use client";

import React, { useState, useEffect } from 'react';
import { Search, History, ArrowUpRight, ArrowDownRight, Filter, Download } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

// Helper to safely get item name from populated item_id
const getTransactionItemName = (transaction: any): string => {
  if (!transaction.item_id) return 'Unknown Item';
  // When populated, item_id is an object with _id and name
  const item = transaction.item_id;
  return item.name || item._id?.toString() || 'Unknown Item';
};

const InventoryTransactionsView: React.FC = () => {
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const transRes = await api.inventory.getTransactions();
      const transData = Array.isArray(transRes) ? transRes : (transRes?.data || []);
      setTransactions(transData);
    } catch (error: any) {
      showNotification('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'production':
        return { color: 'bg-emerald-100 text-emerald-600', label: 'Stock In' };
      case 'sale':
        return { color: 'bg-blue-100 text-blue-600', label: 'Sale' };
      case 'waste':
        return { color: 'bg-rose-100 text-rose-600', label: 'Waste' };
      case 'adjustment':
        return { color: 'bg-amber-100 text-amber-600', label: 'Adjustment' };
      default:
        return { color: 'bg-slate-100 text-slate-600', label: type };
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const itemName = getTransactionItemName(t);
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || t.reference_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: transactions.length,
    purchases: transactions.filter(t => t.reference_type === 'purchase' || t.reference_type === 'production').length,
    sales: transactions.filter(t => t.reference_type === 'sale').length,
    adjustments: transactions.filter(t => t.reference_type === 'adjustment' || t.reference_type === 'waste').length,
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-24" />
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm">Track all inventory movements</p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-1" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Stock In</p>
          <p className="text-xl font-bold text-emerald-600">{stats.purchases}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Sales</p>
          <p className="text-xl font-bold text-blue-600">{stats.sales}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Adjustments</p>
          <p className="text-xl font-bold text-amber-600">{stats.adjustments}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by item name..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'purchase', 'production', 'sale', 'waste', 'adjustment'].map((type: string) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
                filterType === type
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List - Mobile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTransactions.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <History size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const typeInfo = getTypeInfo(t.reference_type || t.type);
            const isPositive = t.change_quantity > 0;
            return (
              <Card key={t.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", typeInfo.color)}>
                    {isPositive ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{getTransactionItemName(t)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="neutral" size="sm" className="capitalize">{typeInfo.label}</Badge>
                    </div>
                  </div>
                  <div className={cn("text-right shrink-0", isPositive ? "text-emerald-600" : "text-rose-600")}>
                    <p className="text-lg font-bold">
                      {isPositive ? '+' : ''}{t.change_quantity}
                    </p>
                    <p className="text-xs text-slate-500">units</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InventoryTransactionsView;
