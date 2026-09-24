import { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, MessageSquare, LogOut, Loader2, KeyRound, Menu, X, Building2, Search, Sun, Moon, Monitor, ShoppingCart, Boxes, Users, ArrowLeftRight, CreditCard, Tag, FileText, BarChart3, Shield, ScrollText, Settings, Zap, WifiOff, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import AdminCommandPalette from './AdminCommandPalette';
import AdminSkeleton from './AdminSkeleton';
import SEO from '../SEO';

const AdminAICopilotWidget = lazy(() => import('./AdminAICopilotWidget'));

export default function AdminLayout() {
  const { adminUser, loading, signInWithEmail, signInAsDemoAdmin, signOut } = useAdminAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('reavo-theme') || 'system');
  const [networkStatus, setNetworkStatus] = useState(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online');
  const [scaleMode, setScaleMode] = useState(() => {
    return localStorage.getItem('reavo-scale-mode') === 'true';
  });

  const userRole = (adminUser?.role || adminUser?.user_metadata?.role || adminUser?.app_metadata?.role || '').toUpperCase();
  const isDeveloperOrOwner = Boolean(
    userRole === 'DEVELOPER' || 
    userRole === 'OWNER' || 
    userRole === 'EXECUTIVE' || 
    (typeof window !== 'undefined' && localStorage.getItem('reavo-demo-admin') === 'true')
  );

  const toggleScaleMode = () => {
    const next = !scaleMode;
    setScaleMode(next);
    localStorage.setItem('reavo-scale-mode', next ? 'true' : 'false');
    window.dispatchEvent(new Event('reavo-scale-mode-changed'));
    if (next) {
      toast.success('🚀 Scale Mode Activated • All Enterprise & Phase 2 Desks Unlocked');
    } else {
      toast.info('🌱 Lean Day-1 Mode Active • Non-essential desks staged for scale');
    }
  };

  useEffect(() => {
    const updateOnline = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('reavo-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  useEffect(() => {
    let lastKey = '';
    let keyTimeout = null;

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts inside inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsCommandPaletteOpen(false);
        return;
      }

      // Linear-style two-key shortcuts: 'g' then next key
      if (lastKey === 'g') {
        clearTimeout(keyTimeout);
        lastKey = '';
        if (e.key === 'd') window.location.hash = '', window.location.pathname = '/admin/dashboard';
        else if (e.key === 'o') window.location.pathname = '/admin/orders';
        else if (e.key === 'p') window.location.pathname = '/admin/products';
        else if (e.key === 'i') window.location.pathname = '/admin/inventory';
        else if (e.key === 'c') window.location.pathname = '/admin/customers';
        else if (e.key === 'a') window.location.pathname = '/admin/analytics';
        else if (e.key === 's') window.location.pathname = '/admin/settings';
        return;
      }

      if (e.key === 'g') {
        lastKey = 'g';
        keyTimeout = setTimeout(() => { lastKey = ''; }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyTimeout) clearTimeout(keyTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <SEO title="Admin | REAVO" noindex={true} />
        <Loader2 className="animate-spin" size={32} color="var(--text-primary)" />
      </div>
    );
  }

  // Login Screen
  if (!adminUser) {
    const handleEmailLogin = async (e) => {
      e.preventDefault();
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        setLoginError(err.message);
      }
    };

    const handleRecovery = async (e) => {
      e.preventDefault();
      if (!recoveryEmail) return;
      setRecoveryLoading(true);
      setRecoveryError('');
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), {
          redirectTo: window.location.origin + '/admin'
        });
        if (error) throw error;
        setRecoverySent(true);
        toast.success('Password recovery email dispatched!');
      } catch (err) {
        setRecoveryError(err.message || 'Failed to send recovery email');
      } finally {
        setRecoveryLoading(false);
      }
    };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <SEO title="Admin Login | REAVO" noindex={true} />
        <div className="glass-panel" style={{ padding: 48, borderRadius: 24, textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <KeyRound size={28} color="var(--text-primary)" />
          </div>

          {!showForgot ? (
            <>
              <h1 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>REAVO Admin OS</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Secure access required for business operations.</p>
              
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input 
                  type="email" 
                  placeholder="Admin Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                />
                <div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button 
                      type="button" 
                      onClick={() => { setShowForgot(true); setLoginError(''); setRecoverySent(false); setRecoveryEmail(email); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500 }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {loginError && <div style={{ color: 'var(--accent-coral)', fontSize: 13, background: 'rgba(255, 107, 74, 0.1)', padding: '8px 12px', borderRadius: 8 }}>{loginError}</div>}
                
                <button 
                  type="submit"
                  className="btn-primary" 
                  style={{ width: '100%', padding: '14px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 }}
                >
                  Sign In
                </button>
              </form>

              <button 
                type="button"
                onClick={signInAsDemoAdmin}
                style={{ 
                  width: '100%', padding: '12px', borderRadius: 12, marginTop: 12,
                  background: 'var(--glass-bg)', border: '1px solid var(--border-active)',
                  color: 'var(--accent-teal)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                ⚡ 1-Click Instant Demo Access
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>Password Recovery</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 }}>
                Enter your registered staff email and we will send you a recovery link to reset your password.
              </p>

              {recoverySent ? (
                <div style={{ background: 'rgba(57, 217, 196, 0.1)', border: '1px solid rgba(57, 217, 196, 0.3)', padding: 20, borderRadius: 12, marginBottom: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-teal)', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                    <CheckCircle2 size={18} /> Recovery Email Sent
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    We dispatched a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{recoveryEmail}</strong>. Please check your inbox and follow the link to set your new password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecovery} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input 
                    type="email" 
                    placeholder="Staff Email Address" 
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                  />
                  {recoveryError && <div style={{ color: 'var(--accent-coral)', fontSize: 13, background: 'rgba(255, 107, 74, 0.1)', padding: '8px 12px', borderRadius: 8 }}>{recoveryError}</div>}
                  <button 
                    type="submit"
                    disabled={recoveryLoading}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '14px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: recoveryLoading ? 0.7 : 1 }}
                  >
                    {recoveryLoading ? 'Sending link...' : 'Send Recovery Link'}
                  </button>
                </form>
              )}

              <button 
                type="button"
                onClick={() => { setShowForgot(false); setRecoveryError(''); setLoginError(''); }}
                style={{ 
                  marginTop: 16, background: 'transparent', border: 'none', 
                  color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </>
          )}

          <Link to="/" style={{ display: 'block', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none' }}>
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if hitting /admin directly
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const navSections = [
    {
      label: null,
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      label: 'Commerce',
      items: [
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
        { name: 'Inventory', path: '/admin/inventory', icon: <Boxes size={20} /> },
        { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
        { name: 'Trade-Ins', path: '/admin/trade-ins', icon: <ArrowLeftRight size={20} /> },
      ]
    },
    {
      label: 'Finance',
      items: [
        { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
        { name: 'Discounts', path: '/admin/discounts', icon: <Tag size={20} /> },
      ]
    },
    {
      label: 'Operations',
      items: [
        { name: 'Content', path: '/admin/content', icon: <FileText size={20} /> },
        { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
        { name: 'AI Copilot', path: '/admin/ai', icon: <MessageSquare size={20} /> },
        { name: 'Automations', path: '/admin/automations', icon: <Zap size={20} /> },
        { name: 'Partnerships', path: '/admin/partnerships', icon: <Building2 size={20} /> },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Staff', path: '/admin/staff', icon: <Shield size={20} /> },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: <ScrollText size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <SEO title="Admin OS | REAVO" noindex={true} />
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{ 
          width: 260, 
          borderRight: '1px solid var(--border-subtle)', 
          background: 'var(--bg-admin-glass)',
          backdropFilter: 'blur(16px)',
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s ease'
        }}>
        <div style={{ padding: '20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} title="REAVO Admin OS">
            <img 
              src="/logos/Reavo Complete@2x.png" 
              alt="REAVO Logo" 
              className="reavo-logo" 
              style={{ height: 26, objectFit: 'contain' }} 
            />
            <span style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              letterSpacing: 1, 
              padding: '2px 7px', 
              borderRadius: 6, 
              background: 'rgba(57, 217, 196, 0.15)', 
              color: 'var(--accent-teal)',
              border: '1px solid rgba(57, 217, 196, 0.3)',
              textTransform: 'uppercase'
            }}>
              OS
            </span>
          </Link>
          <button className="admin-mobile-close" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navSections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div style={{ padding: '14px 12px 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text-secondary)' }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                
                // Specific badges for Lean Day-1 vs Scale Mode:
                let badge = null;
                let isMuted = false;

                if (item.path === '/admin/content' && !scaleMode) {
                  badge = { text: 'Phase 2', bg: 'rgba(124, 92, 255, 0.15)', color: '#A78BFA' };
                  isMuted = true;
                } else if (item.path === '/admin/trade-ins') {
                  badge = { text: 'Beta', bg: 'rgba(255, 184, 0, 0.15)', color: '#FFB800' };
                } else if (item.path === '/admin/staff' && !scaleMode) {
                  badge = { text: '1-Tier', bg: 'rgba(57, 217, 196, 0.15)', color: 'var(--accent-teal)' };
                }

                return (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: isActive ? 'var(--accent-teal)' : isMuted ? 'var(--text-secondary)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--bg-inner)' : 'transparent',
                      border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 13.5,
                      opacity: isMuted && !isActive ? 0.72 : 1
                    }}
                    className="admin-nav-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {badge && (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        padding: '2px 7px', 
                        borderRadius: 100, 
                        background: badge.bg, 
                        color: badge.color,
                        letterSpacing: 0.4
                      }}>
                        {badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Staff Profile Quick-Dock Footer */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inner)' }}>
          <Link 
            to="/admin/profile" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, 
              textDecoration: 'none', color: 'var(--text-primary)', marginBottom: 8,
              transition: 'background 0.2s ease' 
            }}
            className="admin-profile-dock-link"
            title="Open your personal Staff Profile & Workspace Customizer"
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {(adminUser.user_metadata?.full_name || 'Staff')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {adminUser.user_metadata?.full_name || 'Staff User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent-teal)', fontWeight: 500 }}>
                {adminUser.app_metadata?.role || 'Staff Member'} • Customize ⚙️
              </div>
            </div>
          </Link>

          <button 
            onClick={signOut}
            className="admin-logout-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ 
          height: 60, 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: 'var(--bg-admin-glass)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: 16
        }}>
          <div className="admin-mobile-menu" style={{ display: 'none', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <Menu size={24} />
            </button>
            <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logos/Reavo Complete@2x.png" 
                alt="REAVO Logo" 
                className="reavo-logo" 
                style={{ height: 22, objectFit: 'contain' }} 
              />
            </Link>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {/* Global Search */}
            <button 
              className="admin-search-bar" 
              onClick={() => setIsCommandPaletteOpen(true)}
              style={{ 
                maxWidth: 300, width: '100%', height: 36, 
                background: 'var(--bg-inner)', borderRadius: 8, 
                border: '1px solid var(--border-subtle)', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 12px', color: 'var(--text-secondary)', fontSize: 13, 
                cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={16} />
                <span>Search...</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <kbd style={{ background: 'var(--bg-void)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)', fontSize: 11, fontFamily: 'inherit' }}>Ctrl</kbd>
                <kbd style={{ background: 'var(--bg-void)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)', fontSize: 11, fontFamily: 'inherit' }}>K</kbd>
              </div>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Scale Mode Toggle: Reserved strictly for Developer / Owner / Executive */}
            {isDeveloperOrOwner && (
              <button 
                onClick={toggleScaleMode}
                title={scaleMode ? "Scale Mode Active: All Enterprise & Phase 2 Desks Unlocked. Click to toggle." : "Lean Day 1 Active: Advanced desks staged for scale. Click to toggle Scale Mode."}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: scaleMode ? 'rgba(124, 92, 255, 0.15)' : 'rgba(57, 217, 196, 0.12)',
                  border: `1px solid ${scaleMode ? 'rgba(124, 92, 255, 0.4)' : 'rgba(57, 217, 196, 0.3)'}`,
                  color: scaleMode ? '#A78BFA' : '#39D9C4',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{scaleMode ? '🚀 Scale Mode' : '🌱 Lean Day 1'}</span>
                <span style={{ 
                  width: 7, height: 7, borderRadius: '50%', 
                  background: scaleMode ? '#A78BFA' : '#39D9C4',
                  boxShadow: `0 0 8px ${scaleMode ? '#A78BFA' : '#39D9C4'}`
                }} />
              </button>
            )}

            {/* Theme Changer */}
            <button 
              onClick={cycleTheme}
              className="icon-btn"
              title={`Theme: ${theme}`}
              style={{ width: 32, height: 32 }}
            >
              {theme === 'system' && <Monitor size={16} />}
              {theme === 'dark' && <Moon size={16} />}
              {theme === 'light' && <Sun size={16} />}
            </button>
            
            {/* System Online / Network Indicator */}
            <div 
              title={
                networkStatus === 'online' ? 'All systems operational. Network latency normal.' :
                networkStatus === 'poor' ? 'High network latency detected. Live sync may lag.' :
                'Network connection lost. Changes cannot be synchronized.'
              }
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
                padding: '8px 16px', borderRadius: 100, 
                background: networkStatus === 'offline' ? 'rgba(255, 107, 74, 0.1)' : networkStatus === 'poor' ? 'rgba(255, 184, 0, 0.1)' : 'var(--bg-void)',
                border: `1px solid ${networkStatus === 'offline' ? 'rgba(255, 107, 74, 0.4)' : networkStatus === 'poor' ? 'rgba(255, 184, 0, 0.4)' : 'var(--border-subtle)'}`,
                transition: 'all 0.3s ease'
              }}>
              <div style={{ 
                width: 8, height: 8, minWidth: 8, minHeight: 8, borderRadius: '50%', 
                background: networkStatus === 'offline' ? '#FF6B4A' : networkStatus === 'poor' ? '#FFB800' : 'var(--accent-teal)',
                boxShadow: `0 0 12px ${networkStatus === 'offline' ? '#FF6B4A' : networkStatus === 'poor' ? '#FFB800' : 'var(--accent-teal)'}`
              }} className="dot-pulse"></div>
              <span className="system-status-text" style={{ 
                fontSize: 14, fontWeight: 500, 
                color: networkStatus === 'offline' ? '#FF6B4A' : networkStatus === 'poor' ? '#FFB800' : 'var(--text-primary)' 
              }}>
                {networkStatus === 'online' ? 'System Online' : networkStatus === 'poor' ? 'Poor Connection' : 'System Offline'}
              </span>
            </div>
          </div>
        </header>

        {/* Industry-Standard Offline Warning Banner */}
        {networkStatus === 'offline' && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(234, 67, 53, 0.95), rgba(255, 107, 74, 0.95))',
            color: '#FFFFFF',
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <WifiOff size={16} />
            <span>System Offline: Internet connection interrupted. Any changes will not sync until connection is restored.</span>
          </div>
        )}
        
        {/* Page Content */}
        <main className="admin-main-content" style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <Suspense fallback={<AdminSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <AdminCommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      {/* Floating Copilot Widget (suppressed on dedicated AI Operations Command page) */}
      {location.pathname !== '/admin/ai' && (
        <Suspense fallback={null}>
          <AdminAICopilotWidget />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsModalOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}
          onClick={() => setIsShortcutsModalOpen(false)}
        >
          <div 
            className="glass-panel" 
            style={{ width: '100%', maxWidth: 480, padding: 28, borderRadius: 20, border: '1px solid var(--border-subtle)', boxShadow: '0 24px 80px rgba(0,0,0,0.9)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚡</span> Keyboard Navigation Shortcuts
              </div>
              <button onClick={() => setIsShortcutsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { keys: ['Ctrl', 'K'], label: 'Open Command Palette & Global Search' },
                { keys: ['?'], label: 'Open / Close Shortcuts Help' },
                { keys: ['G', 'D'], label: 'Jump to Dashboard' },
                { keys: ['G', 'O'], label: 'Jump to Orders & Fulfillment' },
                { keys: ['G', 'P'], label: 'Jump to Products Catalog' },
                { keys: ['G', 'I'], label: 'Jump to Inventory Control' },
                { keys: ['G', 'C'], label: 'Jump to Customers CRM' },
                { keys: ['G', 'A'], label: 'Jump to Analytics & BI' },
                { keys: ['G', 'S'], label: 'Jump to Store Settings' },
                { keys: ['Esc'], label: 'Close Active Modal / Palette' },
              ].map((sc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sc.label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {sc.keys.map((k, ki) => (
                      <kbd key={ki} style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '3px 7px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: 'var(--accent-teal)' }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-nav-item:hover {
          background: var(--glass-bg) !important;
          color: var(--text-primary) !important;
        }
        .admin-logout-btn:hover {
          background: var(--bg-surface) !important;
          color: var(--accent-coral) !important;
          border-color: var(--border-active) !important;
        }
        .admin-search-bar:hover {
          border-color: var(--border-active) !important;
          box-shadow: var(--shadow-card);
        }
        .system-status-pill:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-card) !important;
        }
        .admin-mobile-close {
          display: none !important;
        }

        /* Desktop */
        @media (min-width: 769px) {
          .admin-sidebar {
            position: sticky;
            top: 0;
            transform: translateX(0) !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-mobile-menu {
            display: block !important;
          }
          .admin-mobile-close {
            display: block !important;
          }
          .admin-main-content {
            padding: 16px !important;
          }
          .system-status-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
