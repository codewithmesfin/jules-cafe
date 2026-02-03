"use client";
import NewOrder from '../../../views/cashier/NewOrder';
import { Suspense } from 'react';

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div>Loading POS...</div>}>
      <NewOrder />
    </Suspense>
  );
}
