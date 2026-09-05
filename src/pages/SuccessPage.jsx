import { useEffect } from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import MeshVisualization from '../components/MeshVisualization';
import anime from 'animejs';

export default function SuccessPage() {
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
          marginBottom: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
          <span className="font-mono" style={{ fontWeight: 600 }}>#RV-{Math.floor(100000 + Math.random() * 900000)}</span>
        </div>

        <Link to="/home" className="btn-primary" style={{ width: '100%' }}>
          Return to Store
        </Link>
      </div>
    </div>
  );
}
