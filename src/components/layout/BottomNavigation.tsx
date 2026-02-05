"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Database, Users, Settings,
  ChefHat, Utensils, ClipboardList, Home
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '@/context/AuthContext';

interface BottomNavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: string[];
  badge?: number;
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems: BottomNavItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard', roles: ['admin', 'manager', 'cashier', 'waiter'] },
    { icon: Receipt, label: 'Orders', path: '/dashboard/orders', roles: ['admin', 'manager', 'cashier'] },
    { icon: Package, label: 'Products', path: '/dashboard/products', roles: ['admin', 'manager', 'cashier'] },
    { icon: Utensils, label: 'Tables', path: '/dashboard/tables', roles: ['admin', 'manager', 'cashier'] },
    { icon: Users, label: 'Customers', path: '/dashboard/customers', roles: ['admin', 'manager', 'cashier'] },
  ];

  const filteredItems = navItems.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role)) || user?.role === 'saas_admin'
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Mobile Bottom Navigation */}
      <div className="bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path !== '/dashboard' && pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <div className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-slate-100'
                    : 'hover:bg-slate-50'
                )}>
                  <item.icon size={20} className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium mt-1 transition-all duration-200',
                  isActive ? 'text-slate-900' : 'text-slate-400'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu */}
          <Link
            href="/dashboard/settings/users"
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
              pathname.startsWith('/dashboard/settings')
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-slate-100'
                : 'hover:bg-slate-50'
            )}>
              <Settings size={20} className={cn(
                'transition-transform duration-200',
                pathname.startsWith('/dashboard/settings') && 'scale-110'
              )} />
            </div>
            <span className={cn(
              'text-[10px] font-medium mt-1 transition-all duration-200',
              pathname.startsWith('/dashboard/settings') ? 'text-slate-900' : 'text-slate-400'
            )}>
              Settings
            </span>
          </Link>
        </div>
      </div>
      
      {/* Safe area padding for notched phones */}
      <div className="h-safe-bottom bg-white" />
    </div>
  );
}
