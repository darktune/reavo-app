import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Navigate, useNavigate } from 'react-router';
import { Package, User, LogOut, Settings, Heart, Loader2, LayoutDashboard, MapPin, MessageSquare, CreditCard, Tag, Search, Mail, HelpCircle, Smartphone, Key, CheckCircle, ArrowUpRight, RefreshCw, Sparkles, Bell, Clock, Trash2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Trade-Ins State
  const [tradeIns, setTradeIns] = useState([
    { id: 'TRD-9021', device: 'iPhone 13 Pro (128GB)', condition: 'Pristine', quote: 340000, status: 'Approved', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'TRD-8842', device: 'MacBook Air M1 (256GB)', condition: 'Good', quote: 410000, status: 'Pending Inspection', created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
  ]);
  const [showTradeInModal, setShowTradeInModal] = useState(false);

  // Pre-Orders State
  const [preorders, setPreorders] = useState([]);

  useEffect(() => {
    const loadPreorders = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('reavo_preorders') || '[]');
        setPreorders(saved);
      } catch {
        setPreorders([]);
      }
    };
    loadPreorders();
    window.addEventListener('storage', loadPreorders);
    return () => window.removeEventListener('storage', loadPreorders);
  }, []);

  const handleCancelPreorder = (id) => {
    if (!window.confirm('Are you sure you want to release your priority waitlist allocation?')) return;
    const next = preorders.filter(p => p.id !== id);
    setPreorders(next);
    localStorage.setItem('reavo_preorders', JSON.stringify(next));
  };

  // Notification States
  const [emailSettings, setEmailSettings] = useState({
    orderUpdates: true,
    promotions: true
  });

  const [notifications, setNotifications] = useState({
    all: true,
    personalized: true,
    suggested: true,
    recommended: false,
    preorders: true,
    ignoreAll: false
  });
  
  const handleToggleNotification = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'ignoreAll' && next.ignoreAll) {
        return { all: false, personalized: false, suggested: false, recommended: false, preorders: false, ignoreAll: true };
      }
      if (key === 'all' && next.all) {
        return { all: true, personalized: true, suggested: true, recommended: true, preorders: true, ignoreAll: false };
      }
      if (key !== 'ignoreAll' && key !== 'all') {
        next.ignoreAll = false;
        next.all = next.personalized && next.suggested && next.recommended && next.preorders;
      }
      return next;
    });
  };

  useEffect(() => {
    if (user?.email) {
      fetchOrders(false);
      setNewName(user?.user_metadata?.full_name || user?.name || '');
      setWhatsappNumber(user?.user_metadata?.whatsapp || user?.phone || '');
      setAddress(user?.user_metadata?.address || '');

      // Add real-time listener for orders so it updates automatically
      const channel = supabase
        .channel('profile_orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_email=eq.${user.email}` }, () => {
          fetchOrders(true);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchOrders(isBackground = false) {
    if (!isBackground) setLoadingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    if (!isBackground) setLoadingOrders(false);
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/profile',
    });
    if (error) alert('Error sending password reset: ' + error.message);
    else alert('A password reset link has been sent to your email address!');
  };

  const handleEnable2FA = () => {
    alert('Two-Factor Authentication setup instructions have been sent to your email.');
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    setUpdating(true);
    setUpdateSuccess(false);
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        full_name: newName,
        whatsapp: whatsappNumber
      }
    });
    setUpdating(false);
    if (!error) {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } else {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleUpdateAddress = async () => {
    setUpdating(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { address: address }
    });
    setUpdating(false);
    if (!error) {
      setEditingAddress(false);
    } else {
      console.error('Error updating address:', error);
      alert('Failed to save address: ' + error.message);
    }
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div style={{ paddingTop: 120, paddingBottom: 120, minHeight: '100vh' }}>
      <div className="container">
        
        <ScrollReveal>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 48 }}>My Account</h1>
        </ScrollReveal>

        <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.5fr', gap: 48 }}>
          
          {/* Sidebar */}
          <ScrollReveal delay={100}>
            <div className="glass-panel profile-sidebar" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-purple)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff',
                  flexShrink: 0
                }}>
                  {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.user_metadata?.full_name || user?.name || 'User'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </div>
              </div>

              <div className="profile-nav-container" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`profile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}>
                  <Package size={18} /> My Orders
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Heart size={18} /> Wishlist & Pre-Orders
                  </div>
                  {preorders.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(255, 184, 0, 0.2)', color: '#FFB800', border: '1px solid rgba(255, 184, 0, 0.4)' }}>
                      {preorders.length} Pre-Order{preorders.length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`profile-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}>
                  <MapPin size={18} /> Address Book
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`profile-nav-btn ${activeTab === 'details' ? 'active' : ''}`}>
                  <User size={18} /> Account Settings
                </button>
                <button 
                  onClick={() => setActiveTab('trade-ins')}
                  className={`profile-nav-btn ${activeTab === 'trade-ins' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Smartphone size={18} /> Device Trade-Ins
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800' }}>
                    Beta
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('support')}
                  className={`profile-nav-btn ${activeTab === 'support' ? 'active' : ''}`}>
                  <HelpCircle size={18} /> Customer Support
                </button>
              </div>

              <button onClick={handleLogout} className="profile-nav-btn logout-btn" style={{ marginTop: 'auto' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </ScrollReveal>

          {/* Main Content */}
          <ScrollReveal delay={200}>
            <div>
              {activeTab === 'overview' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 48 }}>
                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        <Package size={20} color="var(--accent-teal)" />
                        Total Orders
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 600 }}>{orders.length}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        <Heart size={20} color="var(--accent-coral)" />
                        Saved Items
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 600 }}>{wishlistProducts.length}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        <Sparkles size={20} color="#FFB800" />
                        Active Pre-Orders
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 600, color: preorders.length > 0 ? '#FFB800' : 'inherit' }}>{preorders.length}</div>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: 18, marginBottom: 16 }}>Latest Activity</h3>
                  {orders.length > 0 ? (
                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 16 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Order #{orders[0].id.slice(0, 8)}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(orders[0].created_at).toLocaleDateString()}</div>
                        </div>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                          background: orders[0].status === 'Shipped' ? 'rgba(57, 217, 196, 0.1)' : 'rgba(255, 184, 0, 0.1)',
                          color: orders[0].status === 'Shipped' ? '#39D9C4' : '#FFB800'
                        }}>
                          {orders[0].status}
                        </span>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="btn-ghost" style={{ width: '100%', padding: '12px', borderRadius: 8 }}>
                        View All Orders
                      </button>
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No recent activity.
                    </div>
                  )}
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Recent Orders</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {loadingOrders ? (
                      <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 className="animate-spin" size={32} style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
                        <p>Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No recent orders</h3>
                        <p>Your shopping journey begins here.</p>
                        <button onClick={() => navigate('/shop')} style={{ marginTop: 24, padding: '12px 24px', background: 'var(--text-primary)', color: 'var(--bg-void)', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      orders.map(order => {
                        const pin = order.delivery_pin || (order.id ? (parseInt(order.id.replace(/\D/g, '').slice(-4)) || 8492) : 8492);
                        const isDispatched = order.status === 'Shipped' || order.status === 'out_for_delivery' || order.status === 'dispatched';
                        const isRefunded = order.payment_status === 'refunded';
                        const courierPhone = order.shipping_address?.whatsapp_phone || '+2348120001234';

                        return (
                          <div key={order.id} className="glass-panel" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Order #{order.id}</div>
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{order.order_items?.length || 1} gadget(s) ordered</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 6 }}>
                                  ₦{Number(order.total_amount).toLocaleString()}
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                                  {order.discount_code && (
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(57, 217, 196, 0.1)', color: 'var(--accent-teal)' }}>
                                      🏷️ {order.discount_code}
                                    </span>
                                  )}
                                  <span style={{ 
                                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                                    background: isRefunded ? 'rgba(255, 107, 74, 0.15)' : order.status === 'Paid' || isDispatched ? 'rgba(57, 217, 196, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                                    color: isRefunded ? '#FF6B4A' : order.status === 'Paid' || isDispatched ? 'var(--accent-teal)' : '#FFB800'
                                  }}>
                                    {isRefunded ? 'Refunded' : order.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Campus Handover PIN & Courier Live Coordination */}
                            <div style={{ 
                              padding: '12px 16px', borderRadius: 12, 
                              background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                              display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ 
                                  padding: '5px 12px', borderRadius: 8, background: 'rgba(57, 217, 196, 0.12)', 
                                  color: 'var(--accent-teal)', fontWeight: 700, fontSize: 13, fontFamily: 'monospace',
                                  display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(57, 217, 196, 0.3)'
                                }}>
                                  <Key size={14} /> Handover PIN: {pin}
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                  Give this PIN to your campus courier upon parcel arrival.
                                </span>
                              </div>

                              <a 
                                href={`https://wa.me/${courierPhone.replace(/\+/g, '')}?text=Hi%20Courier%2C%20I'm%20checking%20on%20my%20order%20${order.id}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: 6, 
                                  padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                                  background: 'rgba(37, 211, 102, 0.12)', color: '#25D366', textDecoration: 'none',
                                  border: '1px solid rgba(37, 211, 102, 0.3)'
                                }}
                              >
                                <MessageSquare size={13} /> Contact Courier on WhatsApp
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {activeTab === 'wishlist' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 24, margin: 0, color: 'var(--text-primary)' }}>Wishlist & Pre-Orders</h2>
                      <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>
                        Track your saved gadgets and priority 2026 pre-order allocations.
                      </p>
                    </div>
                    {preorders.length > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 700,
                        background: 'rgba(255, 184, 0, 0.15)',
                        border: '1px solid rgba(255, 184, 0, 0.3)',
                        color: '#FFB800'
                      }}>
                        <Sparkles size={14} /> {preorders.length} Active Pre-Order Allocation{preorders.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Active Pre-Orders Waitlist Showcase */}
                  {preorders.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Clock size={18} color="#FFB800" />
                        <h3 style={{ fontSize: 18, margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                          Active 2026 Pre-Order Allocations
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {preorders.map((item) => (
                          <div 
                            key={item.id} 
                            className="glass-panel" 
                            style={{ 
                              padding: 24, 
                              borderRadius: 20, 
                              border: '1px solid rgba(255, 184, 0, 0.3)',
                              background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.05) 0%, var(--bg-card) 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 16
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                  <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.id}</span>
                                  <span style={{ 
                                    padding: '3px 10px', 
                                    borderRadius: 100, 
                                    fontSize: 11, 
                                    fontWeight: 700, 
                                    background: 'rgba(57, 217, 196, 0.15)', 
                                    color: 'var(--accent-teal)',
                                    border: '1px solid rgba(57, 217, 196, 0.3)'
                                  }}>
                                    Allocation Confirmed
                                  </span>
                                  <span style={{
                                    padding: '3px 10px',
                                    borderRadius: 100,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: 'rgba(255, 184, 0, 0.15)',
                                    color: '#FFB800',
                                    border: '1px solid rgba(255, 184, 0, 0.3)'
                                  }}>
                                    Priority Queue #{item.queuePosition || 18}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: 20, margin: '4px 0', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {item.productName}
                                </h4>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                  Configuration: <strong>{item.storage}</strong> • Color: <strong>{item.color}</strong> • Reserved {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <button
                                onClick={() => handleCancelPreorder(item.id)}
                                className="btn-ghost"
                                style={{
                                  padding: '8px 14px',
                                  fontSize: 12,
                                  borderRadius: 100,
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <Trash2 size={13} /> Cancel Allocation
                              </button>
                            </div>

                            {/* WhatsApp Release Notification Alert */}
                            <div style={{
                              padding: '16px 20px',
                              borderRadius: 14,
                              background: 'rgba(37, 211, 102, 0.08)',
                              border: '1px solid rgba(37, 211, 102, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 16
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: '50%',
                                  background: 'rgba(37, 211, 102, 0.18)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <MessageSquare size={20} color="#25D366" />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: '#25D366', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Bell size={14} /> WhatsApp Release Notification Alert
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                                    When this flagship officially lands in Nigeria, REAVO student ops will message your registered WhatsApp (<strong>{whatsappNumber || user?.phone || '09158554158'}</strong>) with your day-one reservation PIN and direct checkout link.
                                  </div>
                                </div>
                              </div>

                              <a
                                href={`https://wa.me/2349158554158?text=Hi%20REAVO%2C%20I'm%20checking%20on%20my%20pre-order%20waitlist%20spot%20(${item.id})%20for%20${encodeURIComponent(item.productName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '10px 18px',
                                  borderRadius: 100,
                                  background: '#25D366',
                                  color: '#000000',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  border: 'none',
                                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                                }}
                              >
                                Reach Concierge (09158554158)
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Saved Items Section */}
                  <h3 style={{ fontSize: 18, marginBottom: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Saved Items</h3>
                  {wishlistProducts.length === 0 ? (
                    <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Heart size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Your wishlist is empty.</p>
                      <button onClick={() => navigate('/shop')} style={{ marginTop: 16, padding: '12px 24px', background: 'var(--text-primary)', color: 'var(--bg-void)', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
                      {wishlistProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'addresses' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Address Book</h2>
                  <div className="glass-panel" style={{ padding: 32 }}>
                    {editingAddress ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Shipping Address</label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="form-input"
                          style={{ width: '100%', minHeight: '100px', background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12, color: 'var(--text-primary)', fontFamily: 'inherit' }}
                          placeholder="e.g. 123 Tech Lane, Silicon Valley, CA 94025"
                        />
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                          <button onClick={handleUpdateAddress} disabled={updating} className="btn-primary" style={{ padding: '10px 24px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            {updating ? 'Saving...' : 'Save Address'}
                          </button>
                          <button onClick={() => setEditingAddress(false)} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: 100 }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : address ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <MapPin size={24} color="var(--accent-teal)" style={{ marginTop: 4 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Default Shipping Address</div>
                            <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{address}</div>
                          </div>
                        </div>
                        <button onClick={() => setEditingAddress(true)} className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13 }}>
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p style={{ marginBottom: 24 }}>You haven't saved any addresses yet.</p>
                        <button onClick={() => setEditingAddress(true)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          Add New Address
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'support' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Customer Support</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => document.getElementById('reavo-assistant-toggle')?.click()}>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                        <MessageSquare size={24} color="var(--text-primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Chat with AI Assistant</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Get instant help from REAVO AI</div>
                      </div>
                    </div>
                    <a href="mailto:support@reavo.com" className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                        <Mail size={24} color="var(--text-primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Email your concerns</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>support@reavo.com</div>
                      </div>
                    </a>
                    <div className="glass-panel" onClick={() => navigate('/faq')} style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                      <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                        <HelpCircle size={24} color="var(--text-primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>FAQs & Tutorials</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Browse our comprehensive help center</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'details' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Account Details</h2>
                  <div className="glass-panel" style={{ padding: 32 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          className="form-input" 
                          style={{ 
                            width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', 
                            padding: '12px 16px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none',
                            transition: 'border-color 0.2s'
                          }} 
                          onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          readOnly 
                          style={{ 
                            width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', 
                            padding: '12px 16px', borderRadius: 8, color: 'var(--text-secondary)', outline: 'none',
                            cursor: 'not-allowed'
                          }} 
                          title="Email address cannot be changed here."
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          WhatsApp Phone Number
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>(Optional)</span>
                        </label>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                          title="Recommended: We send real-time dispatch updates, rider arrival notices, and priority student flash deals directly to your WhatsApp so deliveries never get missed."
                        >
                          <span style={{ 
                            fontSize: 11, fontWeight: 600, color: 'var(--accent-teal)', 
                            background: 'rgba(57, 217, 196, 0.1)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(57, 217, 196, 0.2)' 
                          }}>
                            Recommended
                          </span>
                          <HelpCircle size={14} color="var(--accent-teal)" />
                        </div>
                      </div>
                      <input 
                        type="tel" 
                        value={whatsappNumber} 
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. +234 801 234 5678"
                        className="form-input" 
                        style={{ 
                          width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', 
                          padding: '12px 16px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none',
                          transition: 'border-color 0.2s'
                        }} 
                        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>
                        Why we recommend this: Direct rider delivery coordination on campus so you don't miss calls while in class.
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={updating || !newName.trim() || (newName === (user?.user_metadata?.full_name || user?.name) && whatsappNumber === (user?.user_metadata?.whatsapp || user?.phone || ''))}
                        className="btn-primary" 
                        style={{ 
                          padding: '12px 24px', borderRadius: 100, border: 'none', 
                          cursor: (updating || !newName.trim() || (newName === (user?.user_metadata?.full_name || user?.name) && whatsappNumber === (user?.user_metadata?.whatsapp || user?.phone || ''))) ? 'not-allowed' : 'pointer', 
                          fontWeight: 600,
                          opacity: (updating || !newName.trim() || (newName === (user?.user_metadata?.full_name || user?.name) && whatsappNumber === (user?.user_metadata?.whatsapp || user?.phone || ''))) ? 0.5 : 1,
                          display: 'flex', alignItems: 'center', gap: 8
                        }}
                      >
                        {updating ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Profile'}
                      </button>
                      {updateSuccess && (
                        <span style={{ color: 'var(--accent-teal)', fontSize: 14, fontWeight: 500 }}>
                          ✓ Profile updated successfully
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 24 }}>Preferences</h2>
                  <div className="glass-panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
                    
                    {/* Email Notifications Section */}
                    <section>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Email Notifications</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Order Updates</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Receive emails about your order status and shipping.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={emailSettings.orderUpdates} onChange={() => setEmailSettings(p => ({...p, orderUpdates: !p.orderUpdates}))} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Promotions & Offers</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Get notified about exclusive sales and new product drops.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={emailSettings.promotions} onChange={() => setEmailSettings(p => ({...p, promotions: !p.promotions}))} />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </section>
                    
                    {/* Device Notifications Section */}
                    <section>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Device Notifications</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>All Notifications</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enable all device notifications at once.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.all} onChange={() => handleToggleNotification('all')} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Personalized</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tailored to your specific browsing and purchase history.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.personalized} onChange={() => handleToggleNotification('personalized')} />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Suggested</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Based on items currently in your wishlist or cart.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.suggested} onChange={() => handleToggleNotification('suggested')} />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Recommended</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Trending products and community favorites.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.recommended} onChange={() => handleToggleNotification('recommended')} />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Pre-orders</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Alerts when new unreleased tech is available for pre-order.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.preorders} onChange={() => handleToggleNotification('preorders')} />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,107,74,0.05)', borderRadius: 12, border: '1px solid rgba(255,107,74,0.2)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4, color: 'var(--accent-coral)' }}>Ignore All</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Silence all device notifications completely.</div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={notifications.ignoreAll} onChange={() => handleToggleNotification('ignoreAll')} />
                            <span className="slider"></span>
                          </label>
                        </div>

                      </div>
                    </section>

                    {/* Security Section */}
                    <section>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Security</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Two-Factor Authentication</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add an extra layer of security to your account.</div>
                          </div>
                          <button onClick={handleEnable2FA} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 100 }}>Enable 2FA</button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-void)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Password</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Send a secure reset link to your email.</div>
                          </div>
                          <button onClick={handleChangePassword} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 100 }}>Change Password</button>
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              )}

              {activeTab === 'trade-ins' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: 24, margin: 0, color: 'var(--text-primary)' }}>Device Trade-Ins</h2>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', border: '1px solid rgba(255, 184, 0, 0.3)' }}>
                          REAVO Trade-In Hub • Beta / Rolling Out to Select Campuses
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 14 }}>Exchange your pre-owned smartphone or laptop for store credit or verified campus payouts.</p>
                    </div>
                    <button 
                      onClick={() => setShowTradeInModal(true)}
                      className="btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 100, cursor: 'pointer' }}
                    >
                      <Smartphone size={16} /> Appraise New Gadget
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {tradeIns.map(item => (
                      <div key={item.id} className="glass-panel" style={{ padding: 24, borderRadius: 16, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.id}</span>
                            <span style={{ 
                              padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                              background: item.status === 'Approved' ? 'rgba(57, 217, 196, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                              color: item.status === 'Approved' ? 'var(--accent-teal)' : '#FFB800'
                            }}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{item.device}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Graded Condition: <strong>{item.condition}</strong> • Submitted {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Estimated Trade-In Value</div>
                          <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-teal)' }}>
                            ₦{item.quote.toLocaleString()}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Verified by REAVO Diagnostics</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trade-In Modal */}
                  {showTradeInModal && (
                    <div className="trade-in-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                      <div className="glass-panel trade-in-modal-card" style={{ width: '100%', maxWidth: 480, padding: 32, borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                        <div className="mobile-modal-handle" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Smartphone size={18} color="var(--accent-teal)" /> Device Trade-In Appraisal
                          </h3>
                          <button onClick={() => setShowTradeInModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}>✕</button>
                        </div>
                        
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          const deviceModel = formData.get('deviceModel');
                          const condition = formData.get('condition');
                          const storage = formData.get('storage');
                          
                          const quoteVal = condition === 'Pristine' ? 320000 : condition === 'Good' ? 260000 : 180000;
                          const newSubmission = {
                            id: 'TRD-' + Math.floor(1000 + Math.random() * 9000),
                            device: `${deviceModel} (${storage})`,
                            condition: condition,
                            quote: quoteVal,
                            status: 'Pending Inspection',
                            created_at: new Date().toISOString()
                          };

                          setTradeIns(prev => [newSubmission, ...prev]);
                          setShowTradeInModal(false);
                          
                          try {
                            await supabase.from('trade_ins').insert([{
                              customer_name: user?.user_metadata?.full_name || user?.name || 'Customer',
                              customer_email: user?.email,
                              device_name: newSubmission.device,
                              condition: condition,
                              estimated_value: quoteVal,
                              status: 'pending'
                            }]);
                          } catch {}

                          alert(`Appraisal quote generated: ₦${quoteVal.toLocaleString()}! Our campus agent will contact your WhatsApp to inspect your gadget.`);
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Device & Model</label>
                              <input required name="deviceModel" placeholder="e.g. iPhone 14 Pro, Galaxy S23" className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Storage Capacity</label>
                                <select name="storage" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                  <option value="64GB">64GB</option>
                                  <option value="128GB">128GB</option>
                                  <option value="256GB">256GB</option>
                                  <option value="512GB">512GB</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Physical Condition</label>
                                <select name="condition" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-void)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                  <option value="Pristine">Pristine (No scratches)</option>
                                  <option value="Good">Good (Minor scuffs)</option>
                                  <option value="Fair">Fair (Noticeable wear)</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(57, 217, 196, 0.08)', border: '1px solid rgba(57, 217, 196, 0.2)', fontSize: 12, color: 'var(--text-secondary)' }}>
                              ℹ️ Valuations are verified by REAVO engineers and credited directly to your student wallet upon inspection.
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 100, fontWeight: 600 }}>
                                Submit for Appraisal
                              </button>
                              <button type="button" onClick={() => setShowTradeInModal(false)} className="btn-ghost" style={{ padding: '12px 20px', borderRadius: 100 }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'support' && (
                <>
                  <h2 style={{ fontSize: 24, marginBottom: 12 }}>Customer Support</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Need help with an order, campus delivery, or gadget trade-in? Our team is on standby.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <MessageSquare size={28} color="#25D366" />
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Live WhatsApp Desk</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Direct priority chat with our student operations team.</p>
                      <a 
                        href={`https://wa.me/2349158554158?text=Hi%20REAVO%20Support%2C%20I'm%20${encodeURIComponent(user?.user_metadata?.full_name || 'a customer')}%20and%20need%20assistance.`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-primary" 
                        style={{ marginTop: 'auto', textAlign: 'center', textDecoration: 'none', background: '#25D366', borderColor: '#25D366', color: '#000', fontWeight: 600, padding: '10px', borderRadius: 100 }}
                      >
                        Message WhatsApp (09158554158)
                      </a>
                    </div>

                    <div className="glass-panel" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Mail size={28} color="var(--accent-teal)" />
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Email Support</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>For receipts, warranty claims, and institutional partnerships.</p>
                      <a 
                        href="mailto:support@reavo.com" 
                        className="btn-secondary" 
                        style={{ marginTop: 'auto', textAlign: 'center', textDecoration: 'none', padding: '10px', borderRadius: 100 }}
                      >
                        Email support@reavo.com
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>
          
        </div>
      </div>
      <style>{`
        .profile-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          border: none;
          text-align: left;
          transition: all 0.2s ease;
        }
        .profile-nav-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }
        .profile-nav-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }
        .profile-nav-btn.logout-btn {
          color: var(--accent-coral);
        }
        .profile-nav-btn.logout-btn:hover {
          background: rgba(255, 107, 74, 0.1);
        }

        /* Toggle Switch Styles */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-subtle);
          transition: .3s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .slider {
          background-color: var(--accent-primary);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        .mobile-modal-handle {
          display: none;
        }
        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .profile-sidebar {
            padding: 18px !important;
            border-radius: 16px !important;
            gap: 16px !important;
          }
          .profile-nav-container {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding: 4px 2px 8px 2px !important;
            white-space: nowrap !important;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .profile-nav-container::-webkit-scrollbar {
            display: none;
          }
          .profile-nav-btn {
            flex-shrink: 0 !important;
            padding: 9px 16px !important;
            border-radius: 100px !important;
            font-size: 13px !important;
            background: var(--bg-inner) !important;
            border: 1px solid var(--border-subtle) !important;
          }
          .profile-nav-btn.active {
            background: rgba(57, 217, 196, 0.15) !important;
            color: var(--accent-teal) !important;
            border-color: rgba(57, 217, 196, 0.4) !important;
          }
          .trade-in-modal-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .trade-in-modal-card {
            max-height: 88vh !important;
            border-radius: 24px 24px 0 0 !important;
            padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px)) !important;
            overflow-y: auto !important;
          }
          .mobile-modal-handle {
            display: block !important;
            width: 44px;
            height: 4px;
            background: var(--text-secondary);
            opacity: 0.4;
            border-radius: 4px;
            margin: 0 auto 16px auto;
          }
          .form-input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
