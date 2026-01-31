"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Menu as MenuIcon,
  X,
  Users,
  ShoppingBag,
  Calendar,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Settings,
  MapPin,
  BarChart3,
  PlusSquare,
  ListOrdered,
  Grid,
  Package,
  Database
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getMenuItems = (role: UserRole): MenuItem[] => {
    switch (role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: MapPin, label: 'Branches', path: '/admin/branches' },
          { icon: Settings, label: 'Categories', path: '/admin/categories' },
          { icon: Database, label: 'Items', path: '/admin/items' },
          { icon: Utensils, label: 'Menu Items', path: '/admin/menu-items' },
          { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
          { icon: Calendar, label: 'Reservations', path: '/admin/reservations' },
          { icon: Star, label: 'Reviews', path: '/admin/reviews' },
          { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
          { icon: Utensils, label: 'Recipes', path: '/admin/recipes' },
        ];
      case 'manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/manager' },
          { icon: MapPin, label: 'Branch Profile', path: '/manager/profile' },
          { icon: Settings, label: 'Categories', path: '/manager/categories' },
          { icon: Utensils, label: 'Menu Items', path: '/manager/menu-items' },
          { icon: Package, label: 'Inventory', path: '/manager/inventory' },
          { icon: ShoppingBag, label: 'Orders', path: '/manager/orders' },
          { icon: Utensils, label: 'Recipes', path: '/manager/recipes' },
          { icon: Calendar, label: 'Reservations', path: '/manager/reservations' },
          { icon: Grid, label: 'Tables', path: '/manager/tables' },
          { icon: Users, label: 'Customers', path: '/manager/customers' },
          { icon: Star, label: 'Reviews', path: '/manager/reviews' },
        ];
      case 'cashier':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/cashier' },
          { icon: PlusSquare, label: 'New Order', path: '/cashier/new-order' },
          { icon: ListOrdered, label: 'Order Queue', path: '/cashier/queue' },
        ];
      default:
        return [];
    }
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden md:flex bg-gray-900 text-gray-300 transition-all duration-300 flex-col',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <span className="text-white font-bold text-xl tracking-tight capitalize">
              {user?.role} Panel
            </span>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                pathname === item.path
                  ? 'bg-orange-600 text-white'
                  : 'hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon size={20} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className={cn('flex items-center gap-3 px-3 py-2', isSidebarCollapsed && 'justify-center')}>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-500"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-gray-900 text-gray-300 transition-transform duration-300 flex flex-col z-50 w-64 md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-tight capitalize">
            {user?.role} Panel
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                pathname === item.path
                  ? 'bg-orange-600 text-white'
                  : 'hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 md:hidden text-gray-600 hover:bg-gray-100 rounded"
            >
              <MenuIcon size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
              {menuItems.find(i => i.path === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">View Site</Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
