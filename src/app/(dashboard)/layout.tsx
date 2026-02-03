"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Database, Users, Settings,
  ChevronDown, ChevronLeft, ChevronRight, LogOut, ChefHat, Utensils,
  Plus, ClipboardList
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.status === 'onboarding') { router.push('/company-setup'); return; }
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (inactiveStatuses.includes(user.status)) { router.push('/inactive'); return; }
    if (!user.default_business_id && user.role !== 'saas_admin') { router.push('/company-setup'); }
  }, [user, loading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBusinessSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchBusiness = async (businessId: string) => {
    await switchBusiness(businessId);
    setShowBusinessSelector(false);
    // Trigger full page reload to refresh all data
    window.location.reload();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-slate-900"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-slate-900" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Simplified sidebar menu
  const allMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'manager', 'cashier', 'waiter'] },
    { icon: Receipt, label: 'Orders', path: '/orders', roles: ['admin', 'manager', 'cashier'] },
    {
      icon: Package, label: 'Products', roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Products', path: '/products' },
        { label: 'Categories', path: '/products/categories' },
        { label: 'Menu', path: '/products/menu' },
      ]
    },
    {
      icon: Database, label: 'Inventory', roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Ingredients', path: '/ingredients' },
        { label: 'Stock Levels', path: '/ingredients/inventory' },
        { label: 'Transactions', path: '/ingredients/transactions' },
      ]
    },
    { icon: ChefHat, label: 'Recipes', path: '/recipes', roles: ['admin', 'manager'] },
    { icon: Utensils, label: 'Tables', path: '/tables', roles: ['admin', 'manager', 'cashier'] },
    { icon: Users, label: 'Customers', path: '/customers', roles: ['admin', 'manager', 'cashier'] },
    { icon: ClipboardList, label: 'Reports', path: '/reports', roles: ['admin', 'manager', 'saas_admin'] },
    {
      icon: Settings, label: 'Settings', roles: ['admin', 'manager', 'cashier', 'waiter'],
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

  const userInitials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Logo & Business Selector */}
        <div className="p-4 border-b border-slate-100 relative">
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-between gap-2">
              <div
                className={cn(
                  'flex items-center gap-3 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200 flex-1',
                  !sidebarCollapsed && 'justify-start'
                )}
                onClick={() => setShowBusinessSelector(!showBusinessSelector)}
              >
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <ChefHat size={20} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate">{currentBusiness?.name || 'ABC Cafe'}</span>
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Workspace</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Selector Dropdown */}
            {showBusinessSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                <div className="px-3 pb-2 mb-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Businesses</p>
                </div>
                {businesses?.map((business: any) => (
                  <button
                    key={business._id || business.id}
                    onClick={() => handleSwitchBusiness(business._id || business.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-left transition-all',
                      (currentBusiness?._id || currentBusiness?.id) === (business._id || business.id)
                        ? 'bg-slate-100 text-slate-900'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-bold text-sm flex-shrink-0">
                      {business.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{business.name}</p>
                      <p className="text-xs text-slate-400 truncate">{business.email || 'No email'}</p>
                    </div>
                    {(currentBusiness?._id || currentBusiness?.id) === (business._id || business.id) && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                ))}
                {user.role === 'admin' && (
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      onClick={() => router.push('/settings/business')}
                      className="w-full flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-left text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plus size={16} />
                      </div>
                      <span className="text-sm font-medium">Add New Business</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path ||
              (item.path !== '/' && item.path && pathname.startsWith(item.path)) ||
              (item.submenu?.some(sub => pathname.startsWith(sub.path)));

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200',
                        isActive ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'
                      )}
                      onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className={cn(isActive ? 'text-slate-900' : 'text-slate-400')} />
                        {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown size={14} className={cn('text-slate-400 transition-transform', openSubmenu === item.label && 'rotate-180')} />
                      )}
                    </button>
                    {!sidebarCollapsed && openSubmenu === item.label && item.submenu && (
                      <div className="ml-11 mt-1 space-y-1 pb-2">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm transition-all',
                              pathname === sub.path
                                ? 'text-slate-900 font-semibold bg-slate-100'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path || '#'}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                    )}
                  >
                    <item.icon size={20} className={cn(isActive ? 'text-slate-900' : 'text-slate-400')} />
                    {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-700 font-semibold text-sm flex-shrink-0">
              {userInitials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{user.role}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 mt-3 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 transition-all text-slate-600 text-sm font-medium border border-slate-200"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          {/* Collapse Sidebar Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-700 mr-2"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          {/* Search */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>
            <Link href="/settings/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-semibold text-sm transition-transform group-hover:scale-105">
                {userInitials}
              </div>
              <div className="hidden md:block flex-col">
                <span className="text-sm font-semibold text-slate-900 leading-tight">{user.full_name || 'User'}</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{user.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Icon components
const SearchIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const BellIcon = ({ size, className, ...props }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
