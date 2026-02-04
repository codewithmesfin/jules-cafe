"use client";
import React from 'react';
import ReportsView from '@/views/admin/Reports';
import { RoleGuard } from '@/components/RoleGuard';
export default function ReportsPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'saas_admin']}><ReportsView /></RoleGuard>; }
