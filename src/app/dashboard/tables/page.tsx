"use client";
import React from 'react';
import TablesView from '@/views/manager/Tables';
import { RoleGuard } from '@/components/RoleGuard';
export default function TablesPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><TablesView /></RoleGuard>; }
