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
  ChevronLeft,
  Briefcase,
  BookOpen,
  Tag,
  List
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
      submenu: [{ label: 'New Order', path: '/orders/new' }, { label: 'Live Queue', path: '/orders' }],
      roles: ['admin', 'manager', 'cashier']
    },
    {
      icon: Package,
      label: 'Products',
      path: '/products',
      submenu: [{ label: 'All Catalog', path: '/products' }, { label: 'Categories', path: '/categories' }],
      roles: ['admin', 'manager']
    },
    {
      icon: Database,
      label: 'Inventory',
      path: '/inventory',
      submenu: [{ label: 'Stock Levels', path: '/inventory' }, { label: 'Recipe Engine', path: '/recipes' }],
      roles: ['admin', 'manager']
    },
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
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      {/* Sidebar - Enhanced Light Mode */}
      <aside className="w-72 bg-white text-slate-600 flex flex-col shrink-0 border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-500 z-30">
        {/* Workspace Switcher */}
        <div className="p-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.75rem] cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 font-black scale-95 group-hover:scale-100 transition-transform">
                   {user.full_name?.charAt(0) || 'B'}
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-sm font-black text-slate-900 truncate tracking-tight">Main Hub</span>
                   <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.15em]">Lunix POS</span>
                </div>
             </div>
             <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openSubmenu === item.label;

            return (
              <div key={item.label} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center justify-between px-5 py-4 rounded-[1.25rem] cursor-pointer transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200/50"
                      : "hover:bg-slate-50 text-slate-500 hover:text-blue-600"
                  )}
                  onClick={() => hasSubmenu ? toggleSubmenu(item.label) : router.push(item.path)}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon size={22} className={cn("transition-colors duration-300", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    <ChevronDown size={14} className={cn("transition-transform duration-500 relative z-10", isOpen ? "rotate-180 opacity-100" : "opacity-40")} />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100" />
                  )}
                </div>

                {hasSubmenu && isOpen && (
                  <div className="ml-12 space-y-1 py-3 my-1 border-l-2 border-slate-50">
                    {item.submenu?.map(sub => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={cn(
                          "block px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl ml-2",
                          pathname === sub.path
                            ? "text-blue-600 bg-blue-50/50"
                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
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

        {/* User Session Info / Logout */}
        <div className="p-8 mt-auto bg-slate-50/30 border-t border-slate-50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 transition-all font-black text-[10px] uppercase tracking-[0.25em] shadow-sm active:scale-95"
          >
            <LogOut size={16} />
            Terminate
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12 shrink-0 sticky top-0 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-8 flex-1 max-w-2xl">
             <div className="relative w-full group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
               <input
                 type="text"
                 placeholder="Search Command Center..."
                 className="w-full pl-16 pr-4 py-4 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-900 placeholder:text-slate-400"
               />
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-10">
            <div className="hidden xl:flex items-center gap-6 text-slate-400 border-r border-slate-100 pr-10">
              <button className="p-3.5 hover:bg-slate-50 rounded-[1.25rem] transition-all relative group border border-transparent hover:border-slate-100 active:scale-90">
                <Bell size={22} className="group-hover:text-blue-600" />
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
              </button>
              <button className="p-3.5 hover:bg-slate-50 rounded-[1.25rem] transition-all group border border-transparent hover:border-slate-100 active:scale-90">
                <Moon size={22} className="group-hover:text-blue-600" />
              </button>
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-sm shadow-2xl shadow-slate-200 transition-all group-hover:scale-110 group-hover:rotate-3 active:scale-95 border-2 border-transparent group-hover:border-blue-500/20">
                {user.full_name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">{user.full_name || 'Owner'}</span>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-0.5">{user.role}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors ml-1" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-12 custom-scrollbar">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.03);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
}
