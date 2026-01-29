import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Calendar,
  Star,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Settings,
  ClipboardList,
  Package
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users', roles: ['admin'] },
    { icon: Settings, label: 'Categories', path: '/admin/categories' },
    { icon: Utensils, label: 'Menu Items', path: '/admin/menu-items' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders', roles: ['admin', 'manager', 'cashier', 'staff'] },
    { icon: Calendar, label: 'Reservations', path: '/admin/reservations', roles: ['admin', 'manager', 'cashier', 'staff'] },
    { icon: ClipboardList, label: 'Recipes', path: '/admin/recipes', roles: ['admin', 'manager'] },
    { icon: Package, label: 'Inventory', path: '/admin/inventory', roles: ['admin', 'manager'] },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: ShieldCheck, label: 'Roles', path: '/admin/roles', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gray-900 text-gray-300 transition-all duration-300 flex flex-col',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <span className="text-white font-bold text-xl tracking-tight">AdminPanel</span>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                location.pathname === item.path
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">View Site</Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
