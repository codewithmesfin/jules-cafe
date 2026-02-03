"use client";
import React from 'react';
import InventoryView from '@/views/manager/Inventory';
import { RoleGuard } from '@/components/RoleGuard';
export default function IngredientsPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><InventoryView /></RoleGuard>; }
