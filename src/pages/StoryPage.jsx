import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useUser } from '../context/UserContext';
import MeshVisualization from '../components/MeshVisualization';
import { ArrowRight, ArrowLeft, FastForward } from 'lucide-react';
import anime from 'animejs';

const imagePools = [
  // 0: Creators & lectures
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0040.76a84aa5.jpeg",
    "/ambassadors/14.jpg",
    "/ambassadors/18.jpg"
  ],
  // 1: Gamers & audio
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/20.619ea173.jpeg",
    "/ambassadors/20.jpg",
    "/ambassadors/21.jpg"
  ],
  // 2: Hostel hustle & real people
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0335.ea9bbfbb.jpeg",
    "/ambassadors/24.jpg",
    "/ambassadors/26.jpg"
  ],
  // 3: Campus ambassadors round Nigeria
  [
    "/ambassadors/29.jpg",
    "/ambassadors/31.jpg",
    "/ambassadors/34.jpg",
    "/ambassadors/photo_2026-08-17_20-56-56.jpg"
  ]
];

const InlineImage = ({ poolIndex }) => {
  const pool = imagePools[poolIndex] || imagePools[0];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % pool.length);
    }, 2400 + Math.random() * 800);
    return () => clearInterval(interval);
  }, [pool.length]);

  return (
    <span 
      onMouseEnter={() => setIndex(prev => (prev + 1) % pool.length)}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '0.9em',
        width: '1.6em',
        margin: '0 0.15em',
        borderRadius: '0.25em',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.2)',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15) rotate(-2deg)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
    >
      <img 
        src={pool[index]} 
        alt="REAVO Community" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
      />
    </span>
  );
};

export default function StoryPage() {
  const { userName, userSchool } = useUser();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);

  // Personalized greeting suffix
  const personalizedGreeting = useMemo(() => {
    if (userName && userSchool) {
      return `Welcome to the movement, ${userName} from ${userSchool}.`;
    }
    if (userName) {
      return `Welcome to the movement, ${userName}.`;
    }
    return 'Welcome to the movement, friend.';
  }, [userName, userSchool]);

  // Client-approved revised manifesto: eliminates "boutique", highlights real student hustle & campuses
  // Hyphen/dash removed, sentence with REAVO begins on a new line, personalized welcome on separate line
  const rawSentence = useMemo(() => {
    return `Nigeria's No. 1 student gadget brand. {0} Built for the creator editing between lectures, the gamer grinding {1} after class, and the hustler running a business from a hostel room. Real devices, real prices, real people, {2} from Lagos to Ilorin, to Abia, to Abuja, round Nigeria. {break} REAVO: {3} Your Style. Our Tech. Infinite Possibilities. {break} ${personalizedGreeting}`;
  }, [personalizedGreeting]);
  
  // Parse into tokens: words, image placeholders, and structural line breaks
  const tokens = useMemo(() => {
    const parsed = [];
    const parts = rawSentence.split(/(\{.*?\})/g);
    
    parts.forEach(part => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const key = part.replace(/[{}]/g, '').trim();
        if (key === 'break') {
          parsed.push({ type: 'break' });
        } else {
          parsed.push({ type: 'image', poolIndex: parseInt(key, 10) });
        }
      } else {
        const words = part.split(' ').filter(w => w.trim().length > 0);
        words.forEach(word => parsed.push({ type: 'word', text: word }));
      }
    });
    return parsed;
  }, [rawSentence]);

  // Typing progression
  useEffect(() => {
    if (visibleCount < tokens.length) {
      const nextToken = tokens[visibleCount];
      const stepDelay = nextToken?.type === 'break' ? 80 : 130;
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, stepDelay);
      return () => clearTimeout(timer);
    } else {
      anime({
        targets: '.story-continue-btn',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        easing: 'easeOutSine'
      });
    }
  }, [visibleCount, tokens]);

  const handleSkipAnimation = () => {
    setVisibleCount(tokens.length);
  };

  const isCompleted = visibleCount >= tokens.length;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-void)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Interactive Neural Mesh */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
        <MeshVisualization activeSequence={3} />
      </div>

      {/* Top Floating Control Bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(10,10,12,0.9) 0%, transparent 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100,
            padding: '8px 16px',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </button>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--accent-primary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: 100,
          border: '1px solid rgba(57, 217, 196, 0.25)',
          background: 'rgba(57, 217, 196, 0.08)'
        }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: 'var(--accent-primary)', 
            boxShadow: '0 0 8px rgba(57, 217, 196, 0.7)', 
            display: 'inline-block' 
          }} />
          <span>The REAVO Manifesto</span>
        </div>

        {!isCompleted && (
          <button
            onClick={handleSkipAnimation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            title="Read full manifesto immediately"
          >
            <span>Skip reveal</span>
            <FastForward size={14} />
          </button>
        )}
        {isCompleted && <div style={{ width: 80 }} />}
      </header>

      {/* Main Kinetic Typography Stage */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 1360,
        margin: '0 auto',
        padding: 'clamp(110px, 18vh, 180px) clamp(24px, 6vw, 80px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(36px, 6.5vw, 92px)',
          lineHeight: 1.15,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {tokens.map((token, i) => {
            if (i >= visibleCount) return null;

            if (token.type === 'break') {
              return (
                <span 
                  key={i} 
                  className="story-line-break" 
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    height: 'clamp(20px, 3.5vh, 36px)',
                    pointerEvents: 'none'
                  }} 
                />
              );
            }
            
            if (token.type === 'image') {
              return (
                <span key={i} className="story-token" style={{ animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <InlineImage poolIndex={token.poolIndex} />
                </span>
              );
            }

            const cleanWord = token.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const isNameToken = Boolean(userName && token.text.toLowerCase().includes(userName.toLowerCase())) ||
                                cleanWord === 'friend' ||
                                cleanWord === 'stranger' ||
                                cleanWord === 'guest';
            const isSchoolHighlight = Boolean(userSchool && token.text.includes(userSchool));
            
            return (
              <span 
                key={i} 
                className="story-token"
                style={{ 
                  display: 'inline-block', 
                  marginRight: '0.26em',
                  animation: 'fadeInUp 0.35s ease-out forwards',
                  transition: 'color 0.25s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'default',
                  background: isNameToken 
                    ? 'linear-gradient(135deg, #C084FC 0%, #F472B6 50%, #38BDF8 100%)' 
                    : isSchoolHighlight 
                    ? 'linear-gradient(135deg, #39D9C4 0%, #22D3EE 100%)' 
                    : 'none',
                  WebkitBackgroundClip: (isNameToken || isSchoolHighlight) ? 'text' : 'initial',
                  WebkitTextFillColor: (isNameToken || isSchoolHighlight) ? 'transparent' : 'initial',
                  color: isNameToken 
                    ? '#C084FC' 
                    : isSchoolHighlight 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-primary)',
                  filter: isNameToken 
                    ? 'drop-shadow(0 0 20px rgba(192, 132, 252, 0.55))' 
                    : isSchoolHighlight 
                    ? 'drop-shadow(0 0 20px rgba(57, 217, 196, 0.4))' 
                    : 'none',
                  fontWeight: (isNameToken || isSchoolHighlight) ? 800 : 700,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
                  if (!isNameToken && !isSchoolHighlight) e.currentTarget.style.color = 'var(--accent-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  if (!isNameToken && !isSchoolHighlight) e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {token.text}
              </span>
            );
          })}
        </h1>

        {/* Action Button Deck */}
        <div style={{
          marginTop: '64px',
          display: isCompleted ? 'flex' : 'none',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          <button 
            className="story-continue-btn"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--accent-primary)',
              border: 'none',
              padding: '16px 36px',
              borderRadius: '100px',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 700,
              fontSize: '17px',
              color: '#000000',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(57, 217, 196, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Enter the Store
            <ArrowRight size={20} />
          </button>

          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '16px 28px',
              borderRadius: '100px',
              color: '#FFFFFF',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            Explore Student Gadgets
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
