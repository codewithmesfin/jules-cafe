"use client";

import React from 'react';
import DashboardHome from '../../../views/dashboard/Home';
import { RoleGuard } from '../../../components/RoleGuard';

export default function ManagerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['manager']}>
      <DashboardHome />
    </RoleGuard>
  );
}
