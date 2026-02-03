"use client";
import React from 'react';
import ProductsView from '@/views/admin/Items';
import { RoleGuard } from '@/components/RoleGuard';
export default function ProductsPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><ProductsView /></RoleGuard>; }
