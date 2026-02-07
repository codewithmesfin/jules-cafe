"use client";
import React from 'react';
import CustomerForm from '@/components/forms/CustomerForm';
import { RoleGuard } from '@/components/RoleGuard';

export default function NewCustomerPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}>
      <CustomerForm mode="create" />
    </RoleGuard>
  );
}
