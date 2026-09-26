import { useLocation, useNavigate } from 'react-router';
import { Home, Compass, Heart, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, toggleCart } = useCart();
  const { wishlist } = useWishlist();

  const isHome = location.pathname === '/';
  const isShop = location.pathname === '/shop' && !location.search.includes('wishlist=true');
  const isWishlist = location.search.includes('wishlist=true');

  const openWhatsAppVIP = () => {
    const text = encodeURIComponent('Hi REAVO Team! I am shopping on the REAVO store and would like some assistance choosing the best gadget.');
    window.open(`https://wa.me/2349158554158?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="mobile-bottom-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(9, 10, 12, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none', // Shown via CSS media query @media (max-width: 768px)
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Home"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          color: isHome ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px 0',
          position: 'relative'
        }}
      >
        <Home size={20} strokeWidth={isHome ? 2.5 : 1.8} />
        <span style={{ fontSize: 10, fontWeight: isHome ? 700 : 500, letterSpacing: '0.02em' }}>Home</span>
        {isHome && (
          <span style={{
            position: 'absolute',
            bottom: 2,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--accent-primary)'
          }} />
        )}
      </button>

      {/* 2. Shop Catalog */}
      <button
        type="button"
        onClick={() => navigate('/shop')}
        aria-label="Shop Gadgets"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          color: isShop ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px 0',
          position: 'relative'
        }}
      >
        <Compass size={20} strokeWidth={isShop ? 2.5 : 1.8} />
        <span style={{ fontSize: 10, fontWeight: isShop ? 700 : 500, letterSpacing: '0.02em' }}>Shop</span>
        {isShop && (
          <span style={{
            position: 'absolute',
            bottom: 2,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--accent-primary)'
          }} />
        )}
      </button>

      {/* 3. Wishlist (With Counter Badge) */}
      <button
        type="button"
        onClick={() => navigate('/shop?wishlist=true')}
        aria-label="Wishlist"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          color: isWishlist ? '#FF4757' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px 0',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Heart size={20} strokeWidth={isWishlist ? 2.5 : 1.8} fill={isWishlist ? '#FF4757' : 'none'} />
          {wishlist.length > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -8,
              minWidth: 15,
              height: 15,
              padding: '0 3px',
              borderRadius: 100,
              background: '#FF4757',
              color: '#FFFFFF',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {wishlist.length}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: isWishlist ? 700 : 500, letterSpacing: '0.02em' }}>Wishlist</span>
      </button>

      {/* 4. Bag / Cart (1-Tap Drawer Trigger with Counter) */}
      <button
        type="button"
        onClick={toggleCart}
        aria-label="Shopping Bag"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          color: cartCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px 0',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} strokeWidth={1.8} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -8,
              minWidth: 15,
              height: 15,
              padding: '0 3px',
              borderRadius: 100,
              background: 'var(--accent-primary)',
              color: 'var(--bg-void)',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {cartCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: cartCount > 0 ? 700 : 500, letterSpacing: '0.02em' }}>Bag</span>
      </button>

      {/* 5. WhatsApp VIP Concierge */}
      <button
        type="button"
        onClick={openWhatsAppVIP}
        aria-label="WhatsApp VIP Concierge"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          color: '#25D366',
          cursor: 'pointer',
          padding: '6px 0'
        }}
      >
        <div style={{ position: 'relative' }}>
          <MessageCircle size={20} strokeWidth={1.8} />
          <span style={{
            position: 'absolute',
            top: 0,
            right: -2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#25D366',
            boxShadow: '0 0 6px #25D366'
          }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>VIP Desk</span>
      </button>

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-bar {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
