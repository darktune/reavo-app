import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router';
import { useKorapay } from '../hooks/useKorapay';
import SEO from '../components/SEO';
import { ShieldCheck, ArrowRight, CreditCard, Tag, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const { cartTotal, items, clearCart } = useCart();
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const { initializePayment } = useKorapay();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    whatsappPhone: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const parts = fullName.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || user.user_metadata?.phone || prev.phone,
        whatsappPhone: user.user_metadata?.whatsapp || user.phone || prev.whatsappPhone
      }));
    }
  }, [user]);

  if (loading) {
    return <div style={{ minHeight: '60vh' }} />;
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: 160, paddingBottom: 100, textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: 28, marginBottom: 12, color: 'var(--text-primary)' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add some gadgets before proceeding to checkout.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 100, cursor: 'pointer' }}>
          Explore Products
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    
    const codeUpper = couponCode.trim().toUpperCase();

    // Immediate security sanitization: reject injection payloads and malformed characters
    if (!/^[A-Z0-9_-]+$/.test(codeUpper)) {
      setCouponError('Invalid or expired promo code.');
      setAppliedDiscount(null);
      setApplyingCoupon(false);
      return;
    }

    try {
      // Check Supabase discounts table
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .ilike('code', codeUpper)
        .eq('is_active', true)
        .single();
      
      if (!error && data) {
        let discountValue = 0;
        if (data.type === 'percentage') {
          discountValue = Math.round((cartTotal * Number(data.value)) / 100);
        } else {
          discountValue = Math.min(cartTotal, Number(data.value));
        }
        setAppliedDiscount({ code: data.code, discountValue, description: data.description || `${data.value}% discount` });
        setCouponError('');
        setApplyingCoupon(false);
        return;
      }
    } catch (err) {
      // fallback
    }

    // Standard active discount codes fallback
    if (codeUpper === 'WELCOME10') {
      const discountValue = Math.round(cartTotal * 0.1);
      setAppliedDiscount({ code: 'WELCOME10', discountValue, description: '10% Welcome Discount' });
    } else if (codeUpper === 'STUDENT5') {
      const discountValue = Math.round(cartTotal * 0.05);
      setAppliedDiscount({ code: 'STUDENT5', discountValue, description: '5% Student Campus Discount' });
    } else if (codeUpper === 'CAMPUS1000') {
      const discountValue = Math.min(cartTotal, 1000);
      setAppliedDiscount({ code: 'CAMPUS1000', discountValue, description: '₦1,000 Off Campus Voucher' });
    } else {
      setCouponError('Invalid or expired promo code.');
      setAppliedDiscount(null);
    }
    setApplyingCoupon(false);
  };

  const discountAmount = appliedDiscount?.discountValue || 0;
  const finalPayable = Math.max(0, cartTotal - discountAmount);

  const handlePayClick = (e) => {
    e.preventDefault();
    
    initializePayment({
      amount: finalPayable,
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      onSuccess: async (data) => {
        try {
          // Server-side order processing • prices are re-validated from DB,
          // stock is checked, and all writes use SUPABASE_SERVICE_ROLE_KEY.
          // This prevents client-side price tampering and stock spoofing.
          const res = await fetch('/api/checkout/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map(item => ({
                id: item.id,
                quantity: item.quantity
              })),
              customerInfo: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                whatsappPhone: formData.whatsappPhone || formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                institution: user?.user_metadata?.institution || user?.user_metadata?.school || localStorage.getItem('reavo_userSchool') || null
              },
              discountCode: appliedDiscount?.code || null,
              koraReference: data?.reference || null
            })
          });

          const result = await res.json();

          if (!res.ok || !result.success) {
            console.error('Order API Error:', result);
            alert(result.error || 'Failed to process order. Please contact support.');
            return;
          }

          // Order successfully created server-side
          clearCart();
          navigate('/success');

        } catch (err) {
          console.error('Failed to record order:', err);
          alert('An unexpected error occurred: ' + err.message);
        }
      },
      onClose: () => {
        // User closed payment modal
      }
    });
  };

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <SEO title="Checkout | REAVO" noindex={true} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: 0 }}>Checkout</h1>
        <div style={{ padding: '6px 12px', background: 'rgba(57, 217, 196, 0.1)', color: 'var(--accent-primary)', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} /> Secure Encrypted
        </div>
      </div>
      
      <div className="checkout-grid">
        <div>
          <form id="checkout-form" onSubmit={handlePayClick} className="glass-panel" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
            {!isAuthenticated && (
              <div style={{
                background: 'rgba(255, 184, 0, 0.08)',
                border: '1px solid rgba(255, 184, 0, 0.25)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <span style={{ fontSize: 13, color: '#FFB800' }}>
                  🛒 <strong>Guest Checkout:</strong> No password or sign-up required to place your order.
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Save your order details on the receipt screen.
                </span>
              </div>
            )}
            <h3 style={{ fontSize: 20, marginBottom: 32 }}>1. Shipping Details</h3>
            
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Phone Number</label>
              <input required type="tel" name="phone" placeholder="e.g. 09158554158" value={formData.phone} onChange={handleInputChange} className="form-input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>WhatsApp Phone Number</label>
                <span 
                  title="Recommended: Your campus delivery courier will use this number to send live dispatch alerts, location coordinates, and handover updates directly on WhatsApp."
                  style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(57, 217, 196, 0.1)', padding: '2px 8px', borderRadius: 100, cursor: 'help' }}
                >
                  (Optional - Recommended)
                </span>
              </div>
              <input 
                type="tel" 
                name="whatsappPhone" 
                placeholder="e.g. 09158554158"
                value={formData.whatsappPhone} 
                onChange={handleInputChange} 
                className="form-input" 
              />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>
                Campus couriers send order tracking links and arrival pings directly to your WhatsApp.
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Street Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" />
            </div>

            <div className="form-row">
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>State/Province</label>
                <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" />
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="glass-panel checkout-summary-panel" style={{ padding: 'clamp(24px, 4vw, 40px)', position: 'sticky', top: 120 }}>
            <h3 style={{ fontSize: 20, marginBottom: 32 }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--bg-inner)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span className="font-mono">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Promo / Ambassador Code" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value)} 
                  className="form-input"
                  style={{ textTransform: 'uppercase', flex: '1 1 180px' }}
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon} 
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="btn-secondary"
                  style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, whiteSpace: 'nowrap', fontSize: 13, cursor: 'pointer', flex: '0 0 auto' }}
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {appliedDiscount && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Code <strong>{appliedDiscount.code}</strong> applied ({appliedDiscount.description})</span>
                  <button type="button" onClick={() => setAppliedDiscount(null)} style={{ background: 'none', border: 'none', color: '#FF6B4A', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>Remove</button>
                </div>
              )}
              {couponError && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#FF6B4A' }}>
                  {couponError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Subtotal</span>
                <span className="font-mono">₦{cartTotal.toLocaleString()}</span>
              </div>
              {appliedDiscount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)', fontSize: 14 }}>
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="font-mono">-₦{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>Shipping</span>
                <span className="font-mono">Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 600, fontSize: 18 }}>Total</span>
                <span className="font-mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-primary)' }}>₦{finalPayable.toLocaleString()}</span>
              </div>
            </div>
            
            <button form="checkout-form" type="submit" className="btn-primary desktop-pay-btn" style={{ width: '100%', minHeight: 52, padding: '16px', fontSize: 16, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <CreditCard size={18} /> Pay with KoraPay <ArrowRight size={18} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, color: 'var(--text-secondary)', fontSize: 12 }}>
              <ShieldCheck size={14} />
              <span>Payments secured by KoraPay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Pay Bar (HCI Mobile Thumb Zone) */}
      <div className="mobile-bottom-pay-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Payable</div>
            <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-primary)' }}>₦{finalPayable.toLocaleString()}</div>
          </div>
          {appliedDiscount && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(57, 217, 196, 0.1)', padding: '2px 8px', borderRadius: 100 }}>
              {appliedDiscount.code} (-₦{discountAmount.toLocaleString()})
            </span>
          )}
        </div>
        <button 
          form="checkout-form" 
          type="submit" 
          className="btn-primary" 
          style={{ width: '100%', minHeight: 48, padding: '12px 20px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
        >
          <CreditCard size={18} /> Pay with KoraPay <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          padding: 14px 16px;
          border-radius: 12px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 16px !important;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(57, 217, 196, 0.1);
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 48px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .mobile-bottom-pay-bar {
          display: none;
        }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-bottom: 96px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-input {
            font-size: 16px !important; /* Prevents unwanted iOS auto-zoom */
            padding: 14px !important;
            min-height: 48px;
          }
          .checkout-summary-panel {
            position: static !important;
            top: auto !important;
          }
          .desktop-pay-btn {
            display: none !important;
          }
          .mobile-bottom-pay-bar {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(10, 14, 23, 0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid var(--border-subtle);
            padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
            z-index: 900;
            box-shadow: 0 -8px 28px rgba(0,0,0,0.5);
          }
        }
      `}
      </style>
    </div>
  );
}
