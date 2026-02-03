"use client";
import React from 'react';
import IngredientsListView from '@/views/manager/Ingredients';
import { RoleGuard } from '@/components/RoleGuard';
export default function IngredientsPage() { 
  return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><IngredientsListView /></RoleGuard>; 
}
