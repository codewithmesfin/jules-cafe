"use client";

import React, { Suspense } from 'react';
import NewOrder from '@/views/cashier/NewOrder';
import { RoleGuard } from '@/components/RoleGuard';

function NewOrderContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
      <NewOrder />
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Loading new order...</div>}>
        <NewOrderContent />
      </Suspense>
    </RoleGuard>
  );
}
