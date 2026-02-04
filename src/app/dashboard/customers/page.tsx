"use client";
import React from 'react';
import CustomersView from '@/views/manager/Customers';
import { RoleGuard } from '@/components/RoleGuard';
export default function CustomersPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><CustomersView /></RoleGuard>; }
