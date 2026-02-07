"use client";

import  { Suspense } from 'react';
import OrderQueue from '@/views/cashier/OrderQueue';
import { RoleGuard } from '@/components/RoleGuard';


export default function OrdersPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading orders...</div>}>
         <OrderQueue />
      </Suspense>
    </RoleGuard>
  );
}
