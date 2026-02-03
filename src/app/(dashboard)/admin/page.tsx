"use client";

import React from 'react';
import DashboardHome from '../../../views/dashboard/Home';
import { RoleGuard } from '../../../components/RoleGuard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'saas_admin']}>
      <DashboardHome />
    </RoleGuard>
  );
}
