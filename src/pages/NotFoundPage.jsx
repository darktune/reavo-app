import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(57, 217, 196, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <ScrollReveal>
        <div className="glass-panel" style={{
          padding: 'clamp(32px, 5vw, 64px)',
          borderRadius: 32,
          textAlign: 'center',
          maxWidth: 600,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)'
        }}>
          <h1 style={{
            fontSize: 'clamp(80px, 15vw, 120px)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            background: 'var(--bg-inner)',
            color: 'var(--accent-teal)',
            letterSpacing: '-0.05em'
          }}>404</h1>
          
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 600,
            marginTop: 16,
            marginBottom: 24,
            color: 'var(--text-primary)'
          }}>Lost in the Void</h2>
          
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: 400,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            It seems the page you are looking for has drifted out of our system. Don't worry, we can get you back on track.
          </p>

          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 24px',
                borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link 
              to="/shop"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 16,
                textDecoration: 'none'
              }}
            >
              <Home size={18} />
              Return to Shop
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
