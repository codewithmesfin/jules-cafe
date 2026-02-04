"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Receipt, Package, Database, Users, Settings,
  ChevronDown, ChevronLeft, ChevronRight, LogOut, ChefHat, Utensils,
  Plus, ClipboardList, Menu, X, Bell, Search
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    window.location.reload();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-slate-200 border-t-primary rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-bold animate-pulse">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <ChefHat size={20} />
                  </div>
                  <span className="font-extrabold text-lg">Quick Serve</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {filteredMenuItems.map((item) => (
                   <div key={item.label}>
                     {item.submenu ? (
                       <div className="space-y-1">
                         <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                         {item.submenu.map(sub => (
                           <Link
                             key={sub.path}
                             href={sub.path}
                             onClick={() => setMobileMenuOpen(false)}
                             className={cn(
                               "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                               pathname === sub.path ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                             )}
                           >
                             <div className={cn("w-1.5 h-1.5 rounded-full", pathname === sub.path ? "bg-primary" : "bg-transparent")} />
                             {sub.label}
                           </Link>
                         ))}
                       </div>
                     ) : (
                       <Link
                        href={item.path || '#'}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                          pathname === item.path ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <item.icon size={20} />
                        {item.label}
                      </Link>
                     )}
                   </div>
                ))}
              </nav>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold shadow-sm">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        sidebarCollapsed ? 'w-24' : 'w-72'
      )}>
        <div className="p-6 mb-4">
          <div className={cn("flex items-center gap-3 overflow-hidden", sidebarCollapsed && "justify-center")}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 flex-shrink-0">
              <ChefHat size={26} />
            </div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-extrabold text-xl tracking-tight"
              >
                Quick Serve
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = item.submenu
              ? (pathname === item.path || item.submenu.some(sub => pathname.startsWith(sub.path)))
              : (pathname === item.path);

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => !sidebarCollapsed && setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group',
                        isActive ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-xl transition-all",
                          isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-50 group-hover:bg-white"
                        )}>
                          <item.icon size={20} />
                        </div>
                        {!sidebarCollapsed && <span className="font-bold text-[15px]">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown size={16} className={cn('transition-transform duration-300', openSubmenu === item.label && 'rotate-180')} />
                      )}
                    </button>
                    {!sidebarCollapsed && openSubmenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="ml-14 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={cn(
                              'block px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all',
                              pathname === sub.path
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-900'
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path || '#'}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group',
                      isActive
                        ? 'bg-primary/5 text-primary'
                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-all",
                      isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-50 group-hover:bg-white"
                    )}>
                      <item.icon size={20} />
                    </div>
                    {!sidebarCollapsed && <span className="font-bold text-[15px]">{item.label}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50 mt-auto">
          <div className={cn("flex items-center gap-4", sidebarCollapsed && "justify-center")}>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-bold border border-slate-200">
              {userInitials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.full_name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{user.role}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Header */}
        <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl shadow-sm active:scale-95 transition-all"
            >
              <Menu size={24} className="text-slate-600" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
            >
              {sidebarCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>

            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {allMenuItems.find(m => m.path === pathname || m.submenu?.some(s => s.path === pathname))?.label || 'Overview'}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Workspace / {currentBusiness?.name || 'Quick Serve'}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search resources, orders, or tools..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 relative">
              <Bell size={22} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="w-px h-8 bg-slate-100 mx-2 hidden lg:block"></div>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowBusinessSelector(!showBusinessSelector)}
                className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group active:scale-95"
              >
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-200">
                  {currentBusiness?.name?.charAt(0) || 'Q'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-extrabold text-slate-900 leading-none">{currentBusiness?.name || 'Quick Serve'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Switch</p>
                </div>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform", showBusinessSelector && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showBusinessSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-72 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-3 z-50"
                  >
                    <div className="px-4 py-3 mb-2">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Select Workspace</p>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {businesses?.map((business: any) => (
                        <button
                          key={business._id || business.id}
                          onClick={() => handleSwitchBusiness(business._id || business.id)}
                          className={cn(
                            'w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left',
                            (currentBusiness?._id || currentBusiness?.id) === (business._id || business.id)
                              ? 'bg-primary/5 border border-primary/10'
                              : 'hover:bg-slate-50 border border-transparent'
                          )}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold">
                            {business.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{business.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{business.location || 'Primary Branch'}</p>
                          </div>
                          {(currentBusiness?._id || currentBusiness?.id) === (business._id || business.id) && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 px-1">
                      <Link
                        href="/dashboard/settings/business"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        <Plus size={16} /> Add New Business
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10 pb-32 lg:pb-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile App Navigation Bar */}
        <nav className="fixed bottom-6 left-6 right-6 lg:hidden z-40">
          <div className="glass px-2 py-2 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-white/40">
            {[
              { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
              { icon: Receipt, label: 'Orders', path: '/dashboard/orders/new' },
              { icon: Package, label: 'Items', path: '/dashboard/products' },
              { icon: ClipboardList, label: 'Stats', path: '/dashboard/reports' },
            ].map((item) => {
              const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className={cn(
                    'relative flex flex-col items-center justify-center w-16 h-14 rounded-3xl transition-all duration-300',
                    isActive ? 'text-primary' : 'text-slate-400'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-3xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                  <span className="text-[9px] font-extrabold uppercase tracking-tighter mt-1">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center w-16 h-14 rounded-3xl text-slate-400"
            >
              <Menu size={22} />
              <span className="text-[9px] font-extrabold uppercase tracking-tighter mt-1">Menu</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
