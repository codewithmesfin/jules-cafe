"use client";

import React, { useState, useEffect } from 'react';
import { Search, History, ArrowUpRight, ArrowDownRight, Filter, Download } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

const InventoryTransactionsView: React.FC = () => {
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.inventory.getTransactions();
      setTransactions(Array.isArray(response) ? response : response.data || []);
    } catch (error: any) {
      showNotification('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'production':
        return { icon: ArrowUpRight, color: 'bg-green-100 text-green-600', label: 'Stock In' };
      case 'sale':
        return { icon: ArrowDownRight, color: 'bg-blue-100 text-blue-600', label: 'Sale' };
      case 'waste':
        return { icon: ArrowDownRight, color: 'bg-red-100 text-red-600', label: 'Waste' };
      case 'adjustment':
        return { icon: ArrowUpRight, color: 'bg-amber-100 text-amber-600', label: 'Adjustment' };
      default:
        return { icon: History, color: 'bg-slate-100 text-slate-600', label: type };
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const itemName = (t.item_id as any)?.name || 'Unknown';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || t.reference_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: transactions.length,
    purchases: transactions.filter(t => t.reference_type === 'purchase').length,
    sales: transactions.filter(t => t.reference_type === 'sale').length,
    adjustments: transactions.filter(t => t.reference_type === 'adjustment').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Transactions</h1>
          <p className="text-slate-500">Track all inventory movements</p>
        </div>
        <Button variant="outline">
          <Download size={18} className="mr-2" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Purchases</p>
          <p className="text-2xl font-bold text-green-600">{stats.purchases}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Sales</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sales}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Adjustments</p>
          <p className="text-2xl font-bold text-amber-600">{stats.adjustments}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by item name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'purchase', 'sale', 'adjustment', 'waste'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
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

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="mx-auto h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((t, idx) => {
              const typeInfo = getTypeIcon(t.reference_type);
              const Icon = typeInfo.icon;
              const isPositive = t.change_quantity > 0;

              return (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeInfo.color)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {(t.item_id as any)?.name || 'Unknown Item'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[10px]" variant="neutral">
                        {typeInfo.label}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "text-right",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    <p className="font-semibold">
                      {isPositive ? '+' : ''}{t.change_quantity}
                    </p>
                    <p className="text-xs text-slate-500">units</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTransactionsView;
