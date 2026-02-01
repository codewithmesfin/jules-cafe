"use client";
import React, { Suspense } from 'react';
import CashierNewOrder from "@/views/cashier/NewOrder";

export default function CashierNewOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading terminal...</div>}>
      <CashierNewOrder />
    </Suspense>
  );
}
