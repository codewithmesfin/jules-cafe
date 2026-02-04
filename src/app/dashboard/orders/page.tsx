"use client";

import React, { Suspense } from 'react';
import OrderQueue from '@/views/cashier/OrderQueue';
import { RoleGuard } from '@/components/RoleGuard';

function OrdersContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Order Lists</h1>
      <OrderQueue />
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
