import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  
  const navigate = useNavigate();
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
      <section style={{ textAlign: 'center', padding: '60px 24px 30px' }}>
        <ScrollReveal>
          <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', marginBottom: 20 }}>
            The Faces of REAVO
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Meet the students, creators, and community builders shaping the future of technology across Nigerian campuses.
          </p>
        </ScrollReveal>
      </section>

      {/* Interactive Student Manifesto Feature Card */}
      <section className="container" style={{ marginBottom: 48 }}>
        <ScrollReveal delay={100}>
          <div 
            onClick={() => navigate('/story')}
            className="glass-panel"
            style={{
              padding: '32px clamp(20px, 4vw, 44px)',
              borderRadius: 24,
              cursor: 'pointer',
              border: '1px solid rgba(124, 92, 255, 0.28)',
              background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.08) 0%, rgba(57, 217, 196, 0.05) 100%)',
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.55)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(124, 92, 255, 0.16)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.28)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ maxWidth: 740 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 700, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  color: 'var(--accent-primary)', 
                  background: 'rgba(57, 217, 196, 0.12)', 
                  padding: '3px 10px', 
                  borderRadius: 100 
                }}>
                  <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />
                  Campus Manifesto
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Nigeria's No. 1 Student Brand</span>
              </div>
              <h3 style={{ fontSize: 'clamp(18px, 2.6vw, 26px)', fontWeight: 700, lineHeight: 1.35, marginBottom: 10, color: '#FFFFFF' }}>
                "Built for the creator editing between lectures, the gamer grinding after class, the hustler running a business from a hostel room."
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                From Lagos to Ilorin, to Abia, to Abuja. Real devices, real prices, real people.
                {userName && <span style={{ color: 'var(--accent-purple)', marginLeft: 6 }}>Welcome, {userName}.</span>}
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 100,
              background: 'rgba(124, 92, 255, 0.18)',
              border: '1px solid rgba(124, 92, 255, 0.4)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              <span>Experience The Story</span>
              <ArrowRight size={15} />
            </div>
          </div>
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
