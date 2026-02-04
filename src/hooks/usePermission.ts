"use client";

import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '../types';

/**
 * Hook to check if user has permission for specific actions
 */
export const usePermission = () => {
  const { user } = useAuth();

  const canCreate = (resource: string): boolean => {
    if (!user) return false;
    const role = user.role;

    // Cashiers can ONLY create Orders and Customers
    const createPermissions: Record<string, string[]> = {
      // Products - Only admin/manager
      products: ['admin', 'manager'],
      // Categories - Only admin/manager
      categories: ['admin', 'manager'],
      // Ingredients - Only admin/manager
      ingredients: ['admin', 'manager'],
      // Inventory - Only admin/manager
      inventory: ['admin', 'manager'],
      // Recipes - Only admin/manager
      recipes: ['admin', 'manager'],
      // Menu - Only admin/manager
      menu: ['admin', 'manager'],
      // Orders - Admin, Manager, Cashier, Waiter can create
      orders: ['admin', 'manager', 'cashier', 'waiter'],
      // Customers - Admin, Manager, Cashier can create
      customers: ['admin', 'manager', 'cashier'],
      // Tables - Only admin/manager
      tables: ['admin', 'manager'],
      // Users/Staff - Only admin/manager
      users: ['admin', 'manager'],
      // Reports - Only admin/manager (view only)
      reports: ['admin', 'manager'],
      // Settings - Only admin/manager
      settings: ['admin', 'manager'],
    };

    return createPermissions[resource]?.includes(role as string) || false;
  };

  const canUpdate = (resource: string): boolean => {
    if (!user) return false;
    const role = user.role;

    // Update permissions match create permissions
    const updatePermissions: Record<string, string[]> = {
      products: ['admin', 'manager'],
      categories: ['admin', 'manager'],
      ingredients: ['admin', 'manager'],
      inventory: ['admin', 'manager'],
      recipes: ['admin', 'manager'],
      menu: ['admin', 'manager'],
      orders: ['admin', 'manager', 'cashier'],
      customers: ['admin', 'manager', 'cashier'],
      tables: ['admin', 'manager'],
      users: ['admin', 'manager'],
      reports: ['admin', 'manager'],
      settings: ['admin', 'manager'],
    };

    return updatePermissions[resource]?.includes(role as string) || false;
  };

  const canDelete = (resource: string): boolean => {
    if (!user) return false;
    const role = user.role;

    const deletePermissions: Record<string, string[]> = {
      // Only admin/manager can delete
      products: ['admin', 'manager'],
      categories: ['admin', 'manager'],
      ingredients: ['admin', 'manager'],
      inventory: ['admin', 'manager'],
      recipes: ['admin', 'manager'],
      menu: ['admin', 'manager'],
      // Admin, Manager, Cashier can delete their own orders
      orders: ['admin', 'manager', 'cashier'],
      // Admin, Manager, Cashier can delete customers
      customers: ['admin', 'manager', 'cashier'],
      tables: ['admin', 'manager'],
      users: ['admin'],
      reports: ['admin', 'manager'],
      settings: ['admin', 'manager'],
    };

    return deletePermissions[resource]?.includes(role as string) || false;
  };

  const canView = (resource: string): boolean => {
    if (!user) return false;
    const role = user.role;

    const viewPermissions: Record<string, string[]> = {
      // All staff can view orders and customers
      orders: ['admin', 'manager', 'cashier', 'waiter'],
      customers: ['admin', 'manager', 'cashier', 'waiter'],
      // Cashiers can view products and menu for POS
      products: ['admin', 'manager', 'cashier'],
      menu: ['admin', 'manager', 'cashier'],
      categories: ['admin', 'manager', 'cashier'],
      // Inventory and recipes - admin/manager only
      inventory: ['admin', 'manager'],
      recipes: ['admin', 'manager'],
      // Ingredients - all staff
      ingredients: ['admin', 'manager', 'cashier', 'waiter'],
      // Tables - all operational staff
      tables: ['admin', 'manager', 'cashier', 'waiter'],
      // Users - admin/manager only
      users: ['admin', 'manager'],
      // Reports - admin/manager only
      reports: ['admin', 'manager'],
      // Settings - admin/manager only
      settings: ['admin', 'manager'],
    };

    return viewPermissions[resource]?.includes(role as string) || false;
  };

  return {
    user,
    role: (user?.role as UserRole) || null,
    canCreate,
    canUpdate,
    canDelete,
    canView,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isCashier: user?.role === 'cashier',
    isWaiter: user?.role === 'waiter',
  };
};
