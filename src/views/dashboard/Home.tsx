"use client";

import React from 'react';
import {
  PlusCircle,
  Database,
  CheckSquare,
  Plus,
  TrendingUp,
  CheckCircle,
  Package,
  DollarSign,
  ShoppingCart,
  Printer,
  ChevronRight,
  History,
  Calculator
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-all group border-4 border-blue-500/30">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
            <PlusCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold">New sale</h3>
        </div>

        <div className="bg-white rounded-3xl p-8 text-slate-900 shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 transition-all group">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-50 transition-colors">
            <Database size={32} className="text-slate-600 group-hover:text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold">Inventory Hub</h3>
        </div>

        <div className="bg-white rounded-3xl p-8 text-slate-900 shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 transition-all group">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-50 transition-colors">
            <CheckSquare size={32} className="text-slate-600 group-hover:text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold">Assign Task</h3>
        </div>
      </div>

      {/* Shortcut Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all cursor-pointer min-h-[160px]">
            <Plus size={32} className="mb-2" />
            <span className="font-semibold text-lg">Add Shortcut</span>
          </div>
        ))}
      </div>

      {/* Stats and Register Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Today's Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Sales</p>
              <p className="text-xl font-bold text-slate-900">$0.00</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Paid Orders</p>
              <p className="text-xl font-bold text-slate-900">$0.00</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Package size={20} className="text-orange-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Orders to Fulfill</p>
              <p className="text-xl font-bold text-slate-900">0</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <DollarSign size={20} className="text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payments to Capture</p>
              <p className="text-xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>

        {/* Cash Register */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Cash register</h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-yellow-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Cash</p>
              <p className="text-2xl font-black text-slate-900">$100.00</p>
            </div>
            <div className="ml-auto flex flex-col gap-2">
              <button className="text-xs font-bold text-blue-600 hover:underline text-left">View open session</button>
              <button className="text-xs font-bold text-blue-600 hover:underline text-left">Session history</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="border border-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Calculator size={18} />
              Count cash
            </button>
            <button className="bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
              End Day
            </button>
          </div>
        </div>

        {/* Quick Buttons */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold text-xl shadow-lg shadow-blue-200 flex flex-col items-center justify-center gap-4 group transition-all">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={32} />
            </div>
            Go to cart
          </button>
          <button className="flex-1 border-2 border-slate-200 text-slate-900 rounded-3xl font-bold text-xl hover:bg-slate-50 flex flex-col items-center justify-center gap-4 transition-all group">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
              <Printer size={32} className="text-slate-600" />
            </div>
            Print Last Order Receipt
          </button>
        </div>
      </div>

      {/* Version Footer */}
      <div className="flex justify-end pt-4">
        <span className="text-xs font-medium text-slate-400">v0.1.11</span>
      </div>
    </div>
  );
}
