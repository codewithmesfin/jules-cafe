"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Database,
  Users,
  CheckSquare,
  DollarSign,
  BarChart3,
  CreditCard,
  Percent,
  Zap,
  Settings,
  Search,
  Clock,
  Lock,
  Moon,
  ChevronDown,
  ChevronRight,
  LogOut,
  PlusCircle,
  Bell,
  User as UserIcon,
  LayoutGrid,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  submenu?: { label: string; path: string }[];
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.status === 'onboarding') {
      router.push('/company-setup');
      return;
    }

    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (inactiveStatuses.includes(user.status)) {
      router.push('/inactive');
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'cashier'] },
    {
      icon: ShoppingBag,
      label: 'Orders',
      path: '/orders',
      submenu: [{ label: 'New Order', path: '/orders/new' }, { label: 'Order Queue', path: '/orders' }],
      roles: ['admin', 'manager', 'cashier']
    },
    { icon: Package, label: 'Products', path: '/products', roles: ['admin', 'manager'] },
    { icon: Database, label: 'Inventory', path: '/inventory', roles: ['admin', 'manager'] },
    { icon: LayoutGrid, label: 'Tables', path: '/tables', roles: ['admin', 'manager'] },
    { icon: Users, label: 'Customers', path: '/customers', roles: ['admin', 'manager'] },
    { icon: ShieldCheck, label: 'Staff', path: '/staff', roles: ['admin', 'manager'] },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks', roles: ['admin', 'manager', 'cashier'] },
    { icon: DollarSign, label: 'Finances', path: '/finances', roles: ['admin'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'manager'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'manager'] },
  ];

  const filteredMenuItems = allMenuItems.filter(item =>
    !item.roles || item.roles.includes(user.role) || user.role === 'saas_admin'
  );

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Workspace Switcher Placeholder */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/30 group">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40 font-black">
                   {user.full_name?.charAt(0) || 'B'}
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-sm font-black text-white truncate">Main Workspace</span>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Business</span>
                </div>
             </div>
             <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openSubmenu === item.label;

            return (
              <div key={item.label} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group",
                    isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => hasSubmenu ? toggleSubmenu(item.label) : router.push(item.path)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={22} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400 transition-colors")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    <ChevronDown size={14} className={cn("transition-transform duration-300 opacity-50", isOpen && "rotate-180 opacity-100")} />
                  )}
                </div>

                {hasSubmenu && isOpen && (
                  <div className="ml-10 space-y-1 py-2 border-l border-slate-800/50 my-1">
                    {item.submenu?.map(sub => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={cn(
                          "block px-4 py-2 text-xs font-bold transition-all relative",
                          pathname === sub.path
                            ? "text-white before:absolute before:left-[-1px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-blue-500 before:rounded-full"
                            : "text-slate-500 hover:text-white"
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-800/50 bg-slate-900/30">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-rose-500/10 hover:text-rose-500 border border-slate-700/50 transition-all text-slate-400 font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            Termination Session
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
             <div className="flex items-center gap-2 lg:hidden">
                <div className="w-8 h-8 bg-blue-600 rounded-lg" />
             </div>
             <div className="relative w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
               <input
                 type="text"
                 placeholder="Search Command Center..."
                 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
               />
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-8">
            <div className="hidden xl:flex items-center gap-5 text-slate-400 border-r border-slate-100 pr-8">
              <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
              </button>
              <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all">
                <Moon size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-200 transition-transform group-hover:scale-105">
                {user.full_name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-tight">{user.full_name || 'Business User'}</span>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role} Control</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-10 custom-scrollbar">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
