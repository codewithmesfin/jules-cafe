"use client";
import React from 'react';
import RecipesView from '@/views/admin/Recipes';
import { RoleGuard } from '@/components/RoleGuard';
export default function RecipesPage() { return <RoleGuard allowedRoles={['admin', 'manager']}><RecipesView /></RoleGuard>; }
