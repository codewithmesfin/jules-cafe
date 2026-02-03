"use client";
import React from 'react';
import StockLevelsView from '@/views/manager/StockLevels';
import { RoleGuard } from '@/components/RoleGuard';
export default function InventoryPage() { 
  return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><StockLevelsView /></RoleGuard>; 
}
