"use client";

import React, { Suspense } from 'react';
import OrderArchive from '@/views/manager/OrderArchive';
import { RoleGuard } from '@/components/RoleGuard';

function OrderHistoriesContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Order Histories</h1>
      <OrderArchive />
    </div>
  );
}

export default function OrderHistoriesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading order histories...</div>}>
        <OrderHistoriesContent />
      </Suspense>
    </RoleGuard>
  );
}
