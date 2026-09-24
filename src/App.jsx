import { Routes, Route, useLocation, Navigate } from 'react-router';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import WelcomePrompt from './components/WelcomePrompt';
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
import StaffOnboarding from './pages/StaffOnboarding';

// Code-split Admin OS desks for ultra-fast load speed
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminAIOperations = lazy(() => import('./pages/admin/AdminAIOperations'));
const AdminPartnerships = lazy(() => import('./pages/admin/AdminPartnerships'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminTradeIns = lazy(() => import('./pages/admin/AdminTradeIns'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminDiscounts = lazy(() => import('./pages/admin/AdminDiscounts'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAutomations = lazy(() => import('./pages/admin/AdminAutomations'));

import { ErrorBoundary } from './components/ErrorBoundary';
import { useUser } from './context/UserContext';

function App() {
  const location = useLocation();
  const { trackPageVisit } = useUser();
  const [isLoaded, setIsLoaded] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('reavo_skip_loader') === 'true';
    } catch {
      return false;
    }
  });

  // Track page visits on every route change (for the stranger greeting progression)
  useEffect(() => {
    trackPageVisit();
  }, [location.pathname, trackPageVisit]);

  // Hide nav/footer on /story and admin routes (no longer on /)
  const hideNavAndFooter = location.pathname === '/story' || location.pathname.startsWith('/admin');

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
              {/* Store loads immediately at root — no intro friction */}
              <Route path="/" element={<LandingPage />} />
              {/* Backward compat: /home redirects to / */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/story" element={<StoryPage />} />
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

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {!hideNavAndFooter && <Footer />}
          {!location.pathname.startsWith('/admin') && <CartDrawer />}
          {!location.pathname.startsWith('/admin') && <AssistantWidget />}

          {/* Non-blocking WelcomePrompt overlay — store only, never on /admin */}
          {!location.pathname.startsWith('/admin') && <WelcomePrompt />}

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
