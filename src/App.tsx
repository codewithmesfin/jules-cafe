import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './layouts/MainLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RoleGuard } from './components/RoleGuard';

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
import AdminBranches from './pages/admin/Branches';
import AdminCategories from './pages/admin/Categories';
import AdminMenuItems from './pages/admin/MenuItems';
import AdminOrders from './pages/admin/Orders';
import AdminReservations from './pages/admin/Reservations';
import AdminReviews from './pages/admin/Reviews';
import AdminReports from './pages/admin/Reports';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerBranchProfile from './pages/manager/BranchProfile';
import ManagerOrders from './pages/manager/Orders';
import ManagerReservations from './pages/manager/Reservations';
import ManagerTables from './pages/manager/Tables';
import ManagerReviews from './pages/manager/Reviews';
import ManagerInventory from './pages/manager/Inventory';

// Cashier Pages
import CashierDashboard from './pages/cashier/Dashboard';
import CashierNewOrder from './pages/cashier/NewOrder';
import CashierOrderQueue from './pages/cashier/OrderQueue';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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

              {/* Admin Panel */}
              <Route path="/admin" element={
                <RoleGuard allowedRoles={['admin']}>
                  <DashboardLayout />
                </RoleGuard>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="branches" element={<AdminBranches />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="menu-items" element={<AdminMenuItems />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Manager Panel */}
              <Route path="/manager" element={
                <RoleGuard allowedRoles={['manager']}>
                  <DashboardLayout />
                </RoleGuard>
              }>
                <Route index element={<ManagerDashboard />} />
                <Route path="profile" element={<ManagerBranchProfile />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="menu-items" element={<AdminMenuItems />} />
                <Route path="inventory" element={<ManagerInventory />} />
                <Route path="orders" element={<ManagerOrders />} />
                <Route path="reservations" element={<ManagerReservations />} />
                <Route path="tables" element={<ManagerTables />} />
                <Route path="reviews" element={<ManagerReviews />} />
              </Route>

              {/* Cashier Panel */}
              <Route path="/cashier" element={
                <RoleGuard allowedRoles={['cashier']}>
                  <DashboardLayout />
                </RoleGuard>
              }>
                <Route index element={<CashierDashboard />} />
                <Route path="new-order" element={<CashierNewOrder />} />
                <Route path="queue" element={<CashierOrderQueue />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
