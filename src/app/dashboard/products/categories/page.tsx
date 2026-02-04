"use client";
import React from 'react';
import CategoriesView from '@/views/admin/Categories';
import { RoleGuard } from '@/components/RoleGuard';
export default function CategoriesPage() { return <RoleGuard allowedRoles={['admin', 'manager', 'cashier']}><CategoriesView /></RoleGuard>; }
