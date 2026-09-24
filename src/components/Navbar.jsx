import { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';

/* iOS-style hover card wrapper */
function CardHover({ children, onClick, style = {}, className = '' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        ...style,
        background: hovered ? 'var(--glass-bg)' : 'transparent',
        backdropFilter: hovered ? 'var(--glass-blur)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/shop' },
    { label: 'About', path: '/about' },
    { label: 'Ambassadors', path: '/ambassadors' },
    { label: 'Partnerships', path: '/partnerships' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'var(--bg-void)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Left • Logo */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <CardHover
            onClick={() => navigate('/')}
            style={{ borderRadius: 14, padding: '6px 14px' }}
            title="Go to Home"
          >
            <img
              src="/logos/Reavo Complete@2x.png"
              alt="Reavo Logo"
              className="reavo-logo"
              style={{ height: 28, objectFit: 'contain' }}
            />
          </CardHover>
        </div>

        {/* Center • Links (truly centered via absolute) */}
        <div
          className="hidden-mobile"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
          }}
        >
          {navLinks.map((link) => (
            <CardHover
              key={link.label}
              onClick={() => navigate(link.path)}
              style={{
                borderRadius: 12,
                padding: '8px 16px',
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}>
                {link.label}
              </span>
            </CardHover>
          ))}
        </div>

        {/* Right • Icons */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <CardHover style={{ borderRadius: 12, padding: 8 }} title="Toggle Theme">
            <ThemeToggle />
          </CardHover>

          <CardHover
            onClick={() => setIsSearchModalOpen(true)}
            style={{ borderRadius: 12, padding: 8 }}
            aria-label="Search"
            title="Search"
          >
            <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          </CardHover>

          <CardHover
            onClick={() => isAuthenticated ? navigate('/profile') : setIsAuthModalOpen(true)}
            style={{ borderRadius: 12, padding: 8, position: 'relative' }}
            aria-label="User Profile"
            title={isAuthenticated ? (user?.user_metadata?.full_name ? `${user.user_metadata.full_name} (My Profile)` : 'My Profile') : 'Sign In / Register'}
          >
            <User size={20} style={{ color: isAuthenticated ? 'var(--accent-teal, #39D9C4)' : 'var(--text-secondary)' }} />
            {isAuthenticated && (
              <span style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--accent-teal, #39D9C4)',
                border: '1.5px solid var(--bg-primary)'
              }} />
            )}
          </CardHover>

          <CardHover
            onClick={toggleCart}
            style={{ borderRadius: 12, padding: 8, position: 'relative' }}
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <ShoppingBag size={20} style={{ color: 'var(--text-secondary)' }} />
            {cartCount > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--text-primary)',
                color: 'var(--bg-void)',
                fontSize: 10,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                transform: 'translate(25%, -25%)',
              }}>
                {cartCount}
              </div>
            )}
          </CardHover>
          
          <div className="hidden-desktop" style={{ display: 'none' }}>
            <CardHover
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ borderRadius: 12, padding: 8 }}
              aria-label="Open mobile menu"
              title="Menu"
            >
              <Menu size={20} style={{ color: 'var(--text-primary)' }} />
            </CardHover>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-void)', zIndex: 100,
          display: 'flex', flexDirection: 'column',
          padding: '24px',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <img src="/logos/Reavo Complete@2x.png" alt="Reavo Logo" className="reavo-logo" style={{ height: 28, objectFit: 'contain' }} />
          <button onClick={() => setIsMobileMenuOpen(false)} style={{ padding: 8 }} aria-label="Close mobile menu" title="Close Menu">
            <X size={28} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 24, fontWeight: 600 }}>
          {navLinks.map((link) => (
            <div 
              key={link.label}
              onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }}
              style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}
            >
              {link.label}
            </div>
          ))}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
