import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon, X, UtensilsCrossed } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-orange-600 font-bold text-xl">
            <UtensilsCrossed className="w-8 h-8" />
            <span className="hidden sm:inline">QuickServe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/menu" className="hover:text-orange-600 transition-colors">Menu</Link>
            <Link to="/reservations" className="hover:text-orange-600 transition-colors">Reservations</Link>
            <Link to="/orders" className="hover:text-orange-600 transition-colors">My Orders</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-5 h-5" />
                    <span>{user.full_name.split(' ')[0]}</span>
                  </Button>
                </Link>
                {user.role !== 'customer' && (
                  <Link to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/cashier'}>
                    <Button variant="outline" size="sm" className="capitalize">
                      {user.role} Panel
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button size="sm">Login</Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-4 text-base font-medium">
              <Link to="/menu" onClick={() => setIsMenuOpen(false)}>Menu</Link>
              <Link to="/reservations" onClick={() => setIsMenuOpen(false)}>Reservations</Link>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              <hr />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  {user.role !== 'customer' && (
                    <Link
                      to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/cashier'}
                      onClick={() => setIsMenuOpen(false)}
                      className="capitalize"
                    >
                      {user.role} Panel
                    </Link>
                  )}
                  <button className="text-left text-red-600" onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              <span>QuickServe</span>
            </div>
            <p className="text-sm">
              Providing modern self-service solutions for small restaurant companies.
              Fast, reliable, and delicious.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/menu">Our Menu</Link></li>
              <li><Link to="/reservations">Book a Table</Link></li>
              <li><Link to="/reviews">Customer Reviews</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>123 Foodie Street, Gourmet City</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: hello@quickserve.com</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          © {new Date().getFullYear()} QuickServe Restaurant Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
