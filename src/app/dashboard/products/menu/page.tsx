"use client";
import React from 'react';
import MenuItemsView from '@/views/admin/MenuItems';
import { RoleGuard } from '@/components/RoleGuard';
export default function MenuPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><MenuItemsView /></RoleGuard>; }
