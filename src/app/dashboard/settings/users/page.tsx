"use client";
import React from 'react';
import UsersView from '@/views/admin/Users';
import { RoleGuard } from '@/components/RoleGuard';
export default function UsersSettingsPage() { return <RoleGuard allowedRoles={['admin', 'manager']}><UsersView /></RoleGuard>; }
