"use client";
import React from 'react';
import InventoryTransactionsView from '@/views/manager/InventoryTransactions';
import { RoleGuard } from '@/components/RoleGuard';
export default function TransactionsPage() { 
  return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><InventoryTransactionsView /></RoleGuard>; 
}
