"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Database, Users, Settings,
  ChevronDown, ChevronLeft, ChevronRight, LogOut, ChefHat, Utensils,
  Plus, ClipboardList, Menu, X, Bell, Search, User, Power
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '@/context/AuthContext';
import BottomNavigation from '@/components/layout/BottomNavigation';


interface SubmenuItem {
  label: string;
  path: string;
  roles?: string[];
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  submenu?: SubmenuItem[];
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, switchBusiness, businesses, currentBusiness } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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
        setOpenSubmenu(null);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setShowBusinessSelector(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchBusiness = async (businessId: string) => {
    await switchBusiness(businessId);
    setShowBusinessSelector(false);
    window.location.reload();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-gray-900"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-900" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Sidebar menu items
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
        { label: 'Users & Roles', path: '/dashboard/settings/users', roles: ['admin', 'manager'] },
        { label: 'Units & Conversions', path: '/dashboard/settings/units', roles: ['admin', 'manager', 'cashier'] },
        { label: 'Business Info', path: '/dashboard/settings/business', roles: ['admin', 'manager'] },
      ]
    },
  ];

  const filteredMenuItems = allMenuItems.filter(item => {
    // Filter menu items by role
    if (item.roles && !item.roles.includes(user.role) && user.role !== 'saas_admin') {
      return false;
    }
    // Filter submenu items by role
    if (item.submenu) {
      item.submenu = item.submenu.filter(sub =>
        !sub.roles || (user.role && sub.roles.includes(user.role)) || user.role === 'saas_admin'
      );
      // Only show menu if it has at least one submenu item
      if (item.submenu.length === 0) {
        return false;
      }
    }
    return true;
  });

  const userInitials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email?.[0].toUpperCase() || 'U';

  // Check if current page is a settings page
  const isSettingsPage = pathname.startsWith('/dashboard/settings');

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 lg:hidden border-r border-gray-200',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-900/20">
                <ChefHat size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">{currentBusiness?.name || 'ABC Cafe'}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredMenuItems.map((item) => {
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
                          isActive ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-900'
                        )}
                        onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={20} className={cn(isActive ? 'text-gray-900' : 'text-gray-400')} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronDown size={14} className={cn('text-gray-400 transition-transform', openSubmenu === item.label && 'rotate-180')} />
                      </button>
                      {openSubmenu === item.label && item.submenu && (
                        <div className="ml-11 mt-1 space-y-1 pb-2">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-all',
                                pathname === sub.path
                                  ? 'text-gray-900 font-semibold bg-gray-100'
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'hover:bg-gray-50 hover:text-gray-900 text-gray-600'
                      )}
                    >
                      <item.icon size={20} className={cn(isActive ? 'text-gray-900' : 'text-gray-400')} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 font-semibold text-sm shadow-inner">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-100 transition-all text-gray-600 text-sm font-medium border border-gray-200 shadow-sm"
            >
              <Power size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Logo & Business Selector */}
        <div className="p-4 border-b border-gray-100 relative bg-gray-50/30">
          <div ref={businessDropdownRef} className="relative">
            <div className={cn(
              'flex items-center gap-3 p-2.5 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-all border border-gray-200/60 shadow-sm',
              !sidebarCollapsed ? 'justify-between' : 'justify-center'
            )}
            onClick={() => setShowBusinessSelector(!showBusinessSelector)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-900/20 flex-shrink-0">
                  <ChefHat size={20} />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-gray-900 truncate">{currentBusiness?.name || 'ABC Cafe'}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Workspace</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown 
                  size={16} 
                  className={cn(
                    'text-gray-400 transition-transform flex-shrink-0',
                    showBusinessSelector && 'rotate-180'
                  )}
                />
              )}
            </div>

            {/* Business Selector Dropdown */}
            {showBusinessSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Businesses</p>
                </div>
                {businesses?.map((business: any) => (
                  <button
                    key={business._id || business.id}
                    onClick={() => handleSwitchBusiness(business._id || business.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-left transition-all',
                      (currentBusiness?._id || currentBusiness?.id) === (business._id || business.id)
                        ? 'bg-gray-100 text-gray-900'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0">
                      {business.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{business.name}</p>
                      <p className="text-xs text-gray-400 truncate">{business.email || 'No email'}</p>
                    </div>
                    {(currentBusiness?._id || currentBusiness?.id) === (business._id || business.id) && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                ))}
                {user.role === 'admin' && (
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => router.push('/dashboard/settings/business')}
                      className="w-full flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        isActive ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className={cn(isActive ? 'text-gray-900' : 'text-gray-400')} />
                        {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown size={14} className={cn('text-gray-400 transition-transform', openSubmenu === item.label && 'rotate-180')} />
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
                                ? 'text-gray-900 font-semibold bg-gray-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                        ? 'bg-gray-100 text-gray-900'
                        : 'hover:bg-gray-50 hover:text-gray-900 text-gray-600'
                    )}
                  >
                    <item.icon size={20} className={cn(isActive ? 'text-gray-900' : 'text-gray-400')} />
                    {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Bottom - User Profile */}
        <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/50">
          {/* User Info Card */}
          <div className={cn(
            'flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200/60 shadow-sm',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0 shadow-inner">
                {userInitials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user.role}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="Sign Out"
              >
                <Power size={16} />
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 transition-all text-gray-600 text-sm font-medium border border-gray-200 shadow-sm"
            >
              <Power size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={cn(
          'h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20',
          isSettingsPage && 'lg:hidden'
        )}>
          {/* Mobile: Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Desktop: Collapse Sidebar Button - Styled as Toolbar Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-9 h-9 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-700 mr-2"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-4 flex-1 max-w-xl mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500/10 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>
            
            {/* Desktop User Dropdown */}
            <div className="hidden lg:flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <div ref={userDropdownRef} className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 font-bold text-sm transition-transform group-hover:scale-105 shadow-inner">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-tight">{user.full_name || 'User'}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user.role}</span>
                  </div>
                  <ChevronDown size={14} className={cn('text-gray-400 transition-transform', showUserDropdown && 'rotate-180')} />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 py-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-52 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings/profile"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User size={16} className="text-gray-400" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/dashboard/settings/business"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <ChefHat size={16} className="text-gray-400" />
                        Business Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                      >
                        <Power size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 custom-scrollbar',
          isSettingsPage ? 'pb-24' : 'pb-20 lg:pb-6'
        )}>
          <div className="animate-fade-in max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
