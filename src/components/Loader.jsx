import { useState, useEffect } from 'react';
import anime from 'animejs';

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('reavo_skip_loader') === 'true') {
      if (onComplete) onComplete();
      return;
    }

    // Simulate loading progress
    const duration = 2500;
    const interval = 30;
    let current = 0;
    
    const timer = setInterval(() => {
      current += (100 / (duration / interval)) * (Math.random() * 1.5 + 0.5);
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        
        // Outro animation
        anime({
          targets: '.loader-container',
          opacity: 0,
          scale: 1.05,
          duration: 600,
          easing: 'easeInOutSine',
          complete: () => {
            if (onComplete) onComplete();
          }
        });
      }
      setProgress(Math.min(current, 100));
    }, interval);

    // Beaming animation on logo
    const anim = anime({
      targets: '.loader-logo-shine',
      left: ['-100%', '200%'],
      duration: 1500,
      easing: 'easeInOutSine',
      loop: true
    });

    return () => {
      clearInterval(timer);
      anim.pause();
    };
  }, [onComplete]);

  return (
    <div 
      className="loader-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-admin-glass)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        fontFamily: 'Plus Jakarta Sans',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', padding: '12px 24px', borderRadius: '16px', border: '1px solid var(--border-active)', background: 'var(--glass-bg)' }}>
        <img 
          src="/media_1785971421339.png" 
          alt="REAVO" 
          className="reavo-logo"
          style={{ height: 64, width: 240, objectFit: 'contain' }} 
        />
        {/* Beaming Shine */}
        <div 
          className="loader-logo-shine"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '50%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transform: 'skewX(-20deg)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      <div style={{
        marginTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '300px',
          height: '4px',
          background: 'var(--border-active)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--text-primary)',
            transition: 'width 0.1s linear',
            boxShadow: '0 0 10px var(--border-active)'
          }} />
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em'
        }}>
          INITIALIZING_ {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}
