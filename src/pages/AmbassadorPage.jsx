import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import ScrollReveal from '../components/ScrollReveal';

const ambassadorPhotos = [
  "/ambassadors/14.jpg",
  "/ambassadors/18.jpg",
  "/ambassadors/20.jpg",
  "/ambassadors/21.jpg",
  "/ambassadors/24.jpg",
  "/ambassadors/26.jpg",
  "/ambassadors/29.jpg",
  "/ambassadors/31.jpg",
  "/ambassadors/32.jpg",
  "/ambassadors/34.jpg",
  "/ambassadors/35.jpg",
  "/ambassadors/37.jpg",
  "/ambassadors/photo_2026-08-17_20-56-56.jpg",
  "/ambassadors/photo_2026-08-17_20-58-49.jpg",
];

function useSignatureColor(displayName) {
  const [color, setColor] = useState('#7C5CFF'); // Default fallback

  useEffect(() => {
    if (displayName && displayName !== 'Stranger') {
      // Stable color based on name
      let hash = 0;
      for (let i = 0; i < displayName.length; i++) {
        hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      setColor(`hsl(${hue}, 85%, 65%)`);
    } else {
      // Completely random color each visit for strangers
      const hue = Math.floor(Math.random() * 360);
      setColor(`hsl(${hue}, 85%, 65%)`);
    }
  }, [displayName]);

  return color;
}

export default function AmbassadorPage() {
  const { isAuthenticated, user } = useAuth();
  const { userName } = useUser();
  
  const displayName = (isAuthenticated && user?.name) ? user.name : (userName || 'Stranger');
  const signatureColor = useSignatureColor(displayName);

  // Simple Masonry distribution (3 columns)
  const columns = [[], [], []];
  ambassadorPhotos.forEach((photo, index) => {
    columns[index % 3].push(photo);
  });

  return (
    <div style={{ background: 'var(--bg-void)', paddingTop: 100, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '60px 24px' }}>
        <ScrollReveal>
          <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', marginBottom: 20 }}>
            The Faces of REAVO
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Meet the students, creators, and community builders shaping the future of technology across Nigerian campuses.
          </p>
        </ScrollReveal>
      </section>

      {/* Masonry Gallery */}
      <section className="container" style={{ paddingBottom: 100, flex: 1 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {columns.map((col, colIndex) => (
            <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
              {col.map((photo, i) => (
                <ScrollReveal key={i} delay={(colIndex * 100) + (i * 100)}>
                  <div style={{ 
                    borderRadius: 20, 
                    overflow: 'hidden', 
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <img 
                      src={photo} 
                      alt={`REAVO Campus Ambassador ${colIndex * col.length + i + 1} • Nigeria`} 
                      style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
                      loading="lazy"
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Signature Quote */}
      <section style={{ 
        padding: '120px 24px', 
        background: 'var(--bg-inner)', 
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect based on signature color */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle, ${signatureColor}15 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
        
        <ScrollReveal>
          <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 4vw, 42px)', 
              lineHeight: 1.4,
              fontWeight: 500
            }}>
              "Anyone who is a fan of Reavo is a fan of themselves.<br/>
              You are a fan of yourself, <span style={{ 
                color: signatureColor, 
                fontWeight: 700,
                textShadow: `0 0 30px ${signatureColor}40`,
                transition: 'color 1s ease'
              }}>{displayName}</span>."
            </h2>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
