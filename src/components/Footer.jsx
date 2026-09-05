import { Link } from 'react-router';
import { ArrowUp, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: 'var(--bg-void)',
      paddingTop: 60,
      marginTop: 'auto',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Go to top */}
        <button 
          onClick={scrollToTop}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            background: 'transparent', border: 'none', 
            color: 'var(--accent-primary)', fontSize: 11, fontWeight: 700, 
            letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
            marginBottom: 60, padding: 0
          }}
        >
          <ArrowUp size={14} /> Go to top
        </button>

        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-brand-col" style={{ maxWidth: 360 }}>
            <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logos/Reavo Complete@2x.png" alt="REAVO" className="reavo-logo" style={{ height: 28, width: 100, objectFit: 'contain' }} />
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              REAVO is a technology lifestyle brand producing high-performing hardware and aesthetics designed for ambitious young Nigerians. Your Style. Our Tech. Infinite Possibilities.
            </p>
          </div>
          
          {/* Column 2: Products */}
          <div>
            <h4 className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 20, letterSpacing: 1 }}>OUR PRODUCTS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Link to="/shop?cat=laptops" onClick={scrollToTop} className="footer-link">Pro Laptops</Link>
              <Link to="/shop?cat=tablets" onClick={scrollToTop} className="footer-link">Tablets & Pads</Link>
              <Link to="/shop?cat=smartphones" onClick={scrollToTop} className="footer-link">Smartphones</Link>
              <Link to="/shop?cat=audio" onClick={scrollToTop} className="footer-link">Audio & Wearables</Link>
              <Link to="/shop?cat=accessories" onClick={scrollToTop} className="footer-link">Accessories</Link>
            </div>
          </div>
          
          {/* Column 3: Company */}
          <div>
            <h4 className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 20, letterSpacing: 1 }}>COMPANY</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Link to="/about" onClick={scrollToTop} className="footer-link">The REAVO Story</Link>
              <Link to="/ambassadors" onClick={scrollToTop} className="footer-link">Ambassador Program</Link>
              <Link to="/partnerships" onClick={scrollToTop} className="footer-link">Partnerships</Link>
              <Link to="/compare" onClick={scrollToTop} className="footer-link">Compare Devices</Link>
              <a href="mailto:contact@reavoglobal.com" className="footer-link">Contact Us</a>
            </div>
          </div>

          {/* Column 4: Socials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
            <h4 className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 20, letterSpacing: 1 }}>CONNECT</h4>
            <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
            <a href="https://www.instagram.com/reavo_global?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
            <a href="https://twitter.com/reavoglobal" target="_blank" rel="noopener noreferrer" className="footer-link">X (Twitter)</a>
            <a href="https://www.linkedin.com/company/reavo/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          paddingBottom: 24,
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase' }}>
            © {currentYear} REAVO GLOBAL. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>

      {/* Massive Typography */}
      <div style={{ 
        width: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        justifyContent: 'center',
        paddingTop: '4vw',
        lineHeight: 0.75,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        <h1 style={{ 
          fontSize: 'clamp(100px, 28vw, 400px)', 
          fontWeight: 900, 
          color: 'var(--text-primary)', 
          margin: 0,
          letterSpacing: '-0.04em',
          transform: 'translateY(12%)'
        }}>
          REAVO
        </h1>
      </div>

      <style>{`
        .footer-brand-col {
          grid-column: 1 / -1;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-bottom: 80px;
        }
        @media (min-width: 768px) {
          .footer-brand-col {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        .footer-link {
          color: var(--text-secondary);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--text-primary);
        }
      `}</style>
    </footer>
  );
}
