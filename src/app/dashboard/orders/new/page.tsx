"use client";

import { Suspense } from 'react';
import NewOrder from '@/views/cashier/NewOrder';
import { RoleGuard } from '@/components/RoleGuard';

export default function NewOrderPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-4 md:p-8 text-center font-bold text-slate-400">Loading new order...</div>}>
        <NewOrder />
      </Suspense>
    </RoleGuard>
  );
}
