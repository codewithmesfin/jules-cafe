"use client";

import React, { Suspense } from 'react';
import OrderQueue from '@/views/cashier/OrderQueue';
import NewOrder from '@/views/cashier/NewOrder';
import OrderArchive from '@/views/manager/OrderArchive';
import { RoleGuard } from '@/components/RoleGuard';
import { cn } from '@/utils/cn';
import { LayoutGrid, History, Plus } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') || 'queue';
  const orderId = searchParams.get('id');
  const activeTab = orderId ? 'new' : mode;

  const setMode = (newMode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', newMode);
    params.delete('id');
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {!orderId && (
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button onClick={() => setMode('queue')} className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-black rounded-xl transition-all", activeTab === 'queue' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}><LayoutGrid size={18} />Queue</button>
          <button onClick={() => setMode('new')} className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-black rounded-xl transition-all", activeTab === 'new' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}><Plus size={18} />New Order</button>
          <button onClick={() => setMode('archive')} className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-black rounded-xl transition-all", activeTab === 'archive' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}><History size={18} />Archive</button>
        </div>
      )}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'queue' && <OrderQueue />}
        {activeTab === 'new' && <NewOrder />}
        {activeTab === 'archive' && <OrderArchive />}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading orders...</div>}>
        <OrdersContent />
      </Suspense>
    </RoleGuard>
  );
}
