"use client";
import React from 'react';
import InventoryView from '@/views/manager/InventoryView';
import { RoleGuard } from '@/components/RoleGuard';
export default function InventoryPage() { 
  return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><InventoryView /></RoleGuard>; 
}
