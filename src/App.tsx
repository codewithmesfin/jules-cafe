import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './layouts/MainLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import MenuView from './pages/customer/MenuView';
import ItemDetail from './pages/customer/ItemDetail';
import Cart from './pages/customer/Cart';
import Reservations from './pages/customer/Reservations';
import OrderTracking from './pages/customer/OrderTracking';
import Reviews from './pages/customer/Reviews';
import Profile from './pages/customer/Profile';
import Login from './pages/customer/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminMenuItems from './pages/admin/MenuItems';
import AdminOrders from './pages/admin/Orders';
import AdminReservations from './pages/admin/Reservations';
import AdminReviews from './pages/admin/Reviews';
import AdminRoles from './pages/admin/Roles';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Customer Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<MenuView />} />
                <Route path="/menu/:id" element={<ItemDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="menu-items" element={<AdminMenuItems />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="roles" element={<AdminRoles />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
