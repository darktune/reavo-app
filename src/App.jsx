import { Routes, Route, useLocation, Navigate } from 'react-router';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import IntroPage from './pages/IntroPage';
import StoryPage from './pages/StoryPage';
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import ComparePage from './pages/ComparePage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import PartnershipsPage from './pages/PartnershipsPage';
import AmbassadorPage from './pages/AmbassadorPage';
import NotFoundPage from './pages/NotFoundPage';
import FaqPage from './pages/FaqPage';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import AssistantWidget from './components/assistant/AssistantWidget';
import { WishlistProvider } from './context/WishlistContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAIOperations from './pages/admin/AdminAIOperations';
import AdminPartnerships from './pages/admin/AdminPartnerships';
import AdminProfile from './pages/admin/AdminProfile';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminTradeIns from './pages/admin/AdminTradeIns';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminContent from './pages/admin/AdminContent';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStaff from './pages/admin/AdminStaff';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAutomations from './pages/admin/AdminAutomations';
import StaffOnboarding from './pages/StaffOnboarding';

import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const hideNavAndFooter = location.pathname === '/' || location.pathname === '/story' || location.pathname.startsWith('/admin');

  return (
    <HelmetProvider>
      <AdminAuthProvider>
        <WishlistProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ScrollToTop />
          {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}
          {!hideNavAndFooter && <Navbar />}
          
          <main style={{ flex: 1 }}>
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<IntroPage />} />
              <Route path="/story" element={<StoryPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/partnerships" element={<PartnershipsPage />} />
              <Route path="/ambassadors" element={<AmbassadorPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/staff-onboarding" element={<StaffOnboarding />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="overview" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="trade-ins" element={<AdminTradeIns />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="discounts" element={<AdminDiscounts />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="partnerships" element={<AdminPartnerships />} />
                <Route path="ai" element={<AdminAIOperations />} />
                <Route path="automations" element={<AdminAutomations />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>
              </Routes>
            </ErrorBoundary>
          </main>

          {!hideNavAndFooter && <Footer />}
          {!location.pathname.startsWith('/admin') && <CartDrawer />}
          {!location.pathname.startsWith('/admin') && <AssistantWidget />}
          <Toaster theme="dark" position="bottom-right" toastOptions={{
            style: {
              background: 'rgba(5, 5, 5, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
            }
          }} />
        </div>
      </WishlistProvider>
    </AdminAuthProvider>
    </HelmetProvider>
  );
}

export default App;
