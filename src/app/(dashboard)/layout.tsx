"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Database,
  Users,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
  Search,
  Bell,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChefHat,
  Utensils,
  FileText,
  Truck,
  Boxes,
  ClipboardCheck,
  Building2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  submenu?: { label: string; path: string }[];
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, switchBusiness, businesses, currentBusiness } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);

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

    // Redirect to default business workspace
    if (!user.default_business_id && user.role !== 'saas_admin') {
      router.push('/company-setup');
    }
  }, [user, loading, router]);

  const handleSwitchBusiness = async (businessId: string) => {
    await switchBusiness(businessId);
    setShowBusinessSelector(false);
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'cashier', 'waiter'] },
    {
      icon: ShoppingBag,
      label: 'Orders',
      path: '/orders',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      icon: Package,
      label: 'Products',
      roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Products', path: '/products' },
        { label: 'Categories', path: '/products/categories' },
        { label: 'Menu', path: '/products/menu' },
      ]
    },
    {
      icon: Database,
      label: 'Ingredients',
      roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Ingredients', path: '/ingredients' },
        { label: 'Inventory', path: '/ingredients/inventory' },
        { label: 'Transactions', path: '/ingredients/transactions' },
      ]
    },
    { icon: ChefHat, label: 'Recipes', path: '/recipes', roles: ['admin', 'manager'] },
    { icon: Utensils, label: 'Tables', path: '/tables', roles: ['admin', 'manager', 'cashier'] },
    { icon: Users, label: 'Customers', path: '/customers', roles: ['admin', 'manager', 'cashier'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'manager', 'saas_admin'] },
    {
      icon: Settings,
      label: 'Settings',
      roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Users & Roles', path: '/settings/users' },
        { label: 'Units & Conversions', path: '/settings/units' },
        { label: 'Business Info', path: '/settings/business' },
      ]
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item =>
    !item.roles || item.roles.includes(user.role) || user.role === 'saas_admin'
  );

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 shadow-sm transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-72"
      )}>
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-200">
          <div 
            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200 group"
            onClick={() => setShowBusinessSelector(!showBusinessSelector)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 font-bold">
                {currentBusiness?.name?.charAt(0) || user.full_name?.charAt(0) || 'B'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {currentBusiness?.name || 'Select Business'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Active Workspace</span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown size={16} className={cn(
                "text-slate-400 transition-transform", 
                showBusinessSelector && "rotate-180"
              )} />
            )}
          </div>

          {/* Business Selector Dropdown */}
          {showBusinessSelector && !sidebarCollapsed && (
            <div className="mt-2 p-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {businesses?.map((business: any) => (
                <button
                  key={business._id}
                  onClick={() => handleSwitchBusiness(business._id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                    currentBusiness?._id === business._id 
                      ? "bg-blue-50 text-blue-600" 
                      : "hover:bg-slate-50"
                  )}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs">
                    {business.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium truncate">{business.name}</span>
                </button>
              ))}
              {user.role === 'admin' && (
                <button
                  onClick={() => router.push('/settings/business')}
                  className="w-full flex items-center gap-3 p-2 rounded-lg text-left text-blue-600 hover:bg-blue-50 transition-colors mt-1 border-t border-slate-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <span className="text-sm font-medium">Add New Business</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path && pathname.startsWith(item.path)) ||
              (item.submenu?.some(sub => pathname.startsWith(sub.path)));

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                        isActive ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 hover:text-slate-900"
                      )}
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className={cn(
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        {!sidebarCollapsed && (
                          <span className="font-medium text-sm tracking-tight">{item.label}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "text-slate-400 transition-transform",
                            openSubmenu === item.label && "rotate-180"
                          )} 
                        />
                      )}
                    </div>
                    {/* Submenu */}
                    {!sidebarCollapsed && openSubmenu === item.label && item.submenu && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.submenu.map((sub) => {
                          const isSubActive = pathname === sub.path || pathname.startsWith(sub.path + '/');
                          return (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-colors",
                                isSubActive 
                                  ? "text-blue-600 font-medium" 
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              )}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path || '#'}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                      isActive ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={20} className={cn(
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {!sidebarCollapsed && (
                      <span className="font-medium text-sm tracking-tight">{item.label}</span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User & Logout */}
        <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50">
          <div className={cn("flex items-center gap-3 mb-3", sidebarCollapsed && "justify-center")}>
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 font-bold text-sm shadow-md">
              {user.full_name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.full_name || 'User'}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition-all text-slate-600 text-xs uppercase tracking-widest",
              sidebarCollapsed && "px-2"
            )}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-slate-400 border-r border-slate-100 pr-6">
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <Moon size={18} />
              </button>
            </div>

            <Link 
              href="/settings/profile"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold text-sm shadow-md transition-transform group-hover:scale-105">
                {user.full_name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
              </div>
              <div className="hidden md:block flex-col">
                <span className="text-sm font-bold text-slate-900 leading-tight">{user.full_name || 'User'}</span>
                <span className="text-[10px] text-blue-600 font-medium uppercase tracking-widest">{user.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 8px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
