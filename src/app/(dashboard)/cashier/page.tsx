"use client";

import React from 'react';
import DashboardHome from '../../../views/dashboard/Home';
import { RoleGuard } from '../../../components/RoleGuard';

export default function CashierDashboardPage() {
  return (
    <RoleGuard allowedRoles={['cashier', 'waiter']}>
      <DashboardHome />
    </RoleGuard>
  );
}
