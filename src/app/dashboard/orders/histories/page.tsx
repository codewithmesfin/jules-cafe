"use client";

import { Suspense } from 'react';
import OrderArchive from '@/views/manager/OrderArchive';
import { RoleGuard } from '@/components/RoleGuard';



export default function OrderHistoriesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading order histories...</div>}>
       <OrderArchive />
      </Suspense>
    </RoleGuard>
  );
}
