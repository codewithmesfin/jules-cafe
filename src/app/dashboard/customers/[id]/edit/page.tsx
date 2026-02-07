"use client";
import React, { use } from 'react';
import CustomerForm from '@/components/forms/CustomerForm';
import { RoleGuard } from '@/components/RoleGuard';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <CustomerForm customerId={resolvedParams.id} mode="edit" />
    </RoleGuard>
  );
}
