import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import AuthModal from './AuthModal';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleCheckout = () => {
    if (isAuthenticated) {
      toggleCart();
      navigate('/checkout');
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={toggleCart}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 80,
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s'
        }}
      ></div>

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isCartOpen ? 0 : '-100%',
        bottom: 0,
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 90,
        transition: 'right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: 20 }}>Your Cart</h2>
          <button onClick={toggleCart} className="icon-btn" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40 }}>
              Your cart is empty.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 80, height: 80, background: 'var(--bg-inner)', borderRadius: 8, overflow: 'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="icon-btn" style={{ width: 28, height: 28, border: 'none', background: 'transparent' }} title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    ₦{item.price.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: 4, background: 'var(--bg-inner)', borderRadius: 4 }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 500, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: 4, background: 'var(--bg-inner)', borderRadius: 4 }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inner)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="font-mono" style={{ fontSize: 18, fontWeight: 600 }}>₦{cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="btn-primary" 
              style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-void)' }}
            >
              Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
