"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Settings,
  ChevronDown, ChevronLeft, ChevronRight, ChefHat,
  Plus, ClipboardList, Menu, X, Search, Bell, LogOut,
  Database, Utensils, Users
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'cashier', 'waiter'] },
    {
      icon: Receipt, label: 'Orders', roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'New Order', path: '/dashboard/orders/new' },
        { label: 'Order Queue', path: '/dashboard/orders' },
        { label: 'Order Histories', path: '/dashboard/orders/histories' },
      ]
    },
    {
      icon: Package, label: 'Products', roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Products', path: '/dashboard/products' },
        { label: 'Categories', path: '/dashboard/products/categories' },
        { label: 'Menu', path: '/dashboard/products/menu' },
      ]
    },
    {
      icon: Database, label: 'Inventory', roles: ['admin', 'manager', 'cashier'],
      submenu: [
        { label: 'Ingredients', path: '/dashboard/ingredients' },
        { label: 'Stock Levels', path: '/dashboard/ingredients/inventory' },
        { label: 'Transactions', path: '/dashboard/ingredients/transactions' },
      ]
    },
    { icon: ChefHat, label: 'Recipes', path: '/dashboard/recipes', roles: ['admin', 'manager'] },
    { icon: Utensils, label: 'Tables', path: '/dashboard/tables', roles: ['admin', 'manager', 'cashier'] },
    { icon: Users, label: 'Customers', path: '/dashboard/customers', roles: ['admin', 'manager', 'cashier'] },
    { icon: ClipboardList, label: 'Reports', path: '/dashboard/reports', roles: ['admin', 'manager', 'saas_admin'] },
    {
      icon: Settings, label: 'Settings', roles: ['admin', 'manager', 'cashier', 'waiter'],
      submenu: [
        { label: 'Users & Roles', path: '/dashboard/settings/users' },
        { label: 'Units & Conversions', path: '/dashboard/settings/units' },
        { label: 'Business Info', path: '/dashboard/settings/business' },
      ]
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item =>
    !item.roles || item.roles.includes(user.role) || user.role === 'saas_admin'
  );

  const userInitials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 lg:relative flex flex-col bg-white border-r border-slate-100 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
        mobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Mobile Close Button */}
        <button
          className="absolute top-4 -right-12 p-2 bg-white rounded-xl shadow-lg lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={20} className="text-slate-600" />
        </button>

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
                    <span className="text-sm font-semibold text-slate-900 truncate">{currentBusiness?.name || 'Quick Serve'}</span>
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
                      onClick={() => router.push('/dashboard/settings/business')}
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
            // Direct items (no submenu) are active only on exact path match
            // Parent items (with submenu) are active on exact path OR any submenu path
            const isActive = item.submenu
              ? (pathname === item.path || item.submenu.some(sub => pathname.startsWith(sub.path)))
              : (pathname === item.path);

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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 active:scale-95"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Collapse Sidebar Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
            >
              {sidebarCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>

            <h1 className="text-lg lg:text-xl font-bold text-slate-900 truncate">
              {filteredMenuItems.find(m => m.path === pathname || m.submenu?.some(s => s.path === pathname))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e60023] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#e60023]/5 focus:bg-white focus:border-[#e60023]/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 relative group">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#e60023] rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <Link href="/dashboard/settings/profile" className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-2xl transition-all group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200 transition-transform group-hover:scale-105">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-tight">{user.full_name?.split(' ')[0] || 'User'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-1">{user.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8 pb-24 lg:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 py-3 flex items-center justify-around lg:hidden z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          {[
            { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
            { icon: Receipt, label: 'Orders', path: '/dashboard/orders/new' },
            { icon: Package, label: 'Products', path: '/dashboard/products' },
            { icon: ClipboardList, label: 'Reports', path: '/dashboard/reports' },
          ].map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                href={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 transition-all active:scale-90',
                  isActive ? 'text-[#e60023]' : 'text-slate-400'
                )}
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all',
                  isActive ? 'bg-[#e60023]/10' : 'bg-transparent'
                )}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
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
