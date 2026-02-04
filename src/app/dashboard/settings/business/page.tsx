"use client";
import React from 'react';
import BusinessInfoView from '@/views/admin/CompanyManagement';
import { RoleGuard } from '@/components/RoleGuard';
export default function BusinessSettingsPage() { return <RoleGuard allowedRoles={['admin', 'manager']}><BusinessInfoView /></RoleGuard>; }
