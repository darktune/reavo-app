import { useEffect } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MeshVisualization from '../components/MeshVisualization';
import anime from 'animejs';

export default function SuccessPage() {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  useEffect(() => {
    anime({
      targets: '.success-content',
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1000,
      easing: 'easeOutExpo'
    });
    
    anime({
      targets: '.success-icon',
      scale: [0, 1],
      rotate: [-90, 0],
      duration: 800,
      delay: 200,
      easing: 'easeOutElastic(1, .5)'
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: 'var(--bg-void)'
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}>
        <MeshVisualization activeSequence={1} />
      </div>

      <div className="success-content glass-panel" style={{
        position: 'relative',
        zIndex: 10,
        padding: '64px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 500,
        width: '90%',
        opacity: 0 // handled by animejs
      }}>
        <div className="success-icon" style={{ color: 'var(--accent-lime)', marginBottom: 32 }}>
          <CheckCircle size={80} strokeWidth={1.5} />
        </div>
        
        <h1 style={{ fontSize: 40, marginBottom: 16 }}>Order Confirmed</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
          Thank you for choosing REAVO. Your payment was successful and we're processing your order right now.
        </p>

        <div style={{
          width: '100%',
          padding: 24,
          background: 'var(--bg-inner)',
          borderRadius: 16,
          border: '1px solid var(--border-subtle)',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
          <span className="font-mono" style={{ fontWeight: 600 }}>#RV-{Math.floor(100000 + Math.random() * 900000)}</span>
        </div>

        {!isAuthenticated && (
          <div style={{
            width: '100%',
            padding: 20,
            background: 'rgba(57, 217, 196, 0.08)',
            border: '1px solid rgba(57, 217, 196, 0.25)',
            borderRadius: 16,
            marginBottom: 28,
            textAlign: 'left',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Save Your Order to Track Delivery
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.4 }}>
              Link your purchase with 1-click Google Sign-In to receive SMS dispatch tracking and access your warranty receipt anytime.
            </div>
            <button
              type="button"
              onClick={() => signInWithGoogle('/profile')}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 10,
                background: '#FFFFFF',
                color: '#1F1F1F',
                border: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Save Order with Google</span>
            </button>
          </div>
        )}

        <Link to="/home" className="btn-primary" style={{ width: '100%' }}>
          Return to Store
        </Link>
      </div>
    </div>
  );
}
