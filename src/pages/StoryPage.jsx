import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import MeshVisualization from '../components/MeshVisualization';
import { ArrowRight } from 'lucide-react';
import anime from 'animejs';

const imagePools = [
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0040.76a84aa5.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/DSC04369.b9a907ea.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/21.a3a213b3.jpeg"
  ],
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/20.619ea173.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/6.a6921430.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0303-1.0dbd5734.jpeg"
  ],
  [
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0335.ea9bbfbb.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0203.318a82ed.jpeg",
    "https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0255.fb2308c7.jpeg"
  ]
];

const InlineImage = ({ poolIndex }) => {
  const pool = imagePools[poolIndex];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % pool.length);
    }, 2500 + Math.random() * 1000); // Random offset for organic feeling
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
        borderRadius: '0.2em',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(-2deg)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
    >
      <img 
        src={pool[index]} 
        alt="Visual" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
      />
    </span>
  );
};

export default function StoryPage() {
  const { userName } = useUser();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(0);

  const rawSentence = `REAVO is a {0} boutique technology lifestyle brand, producing limited runs of high-performing {1} gadgets & apparel for the person who knows exactly what they want to become. {2} We know the campus hustle. Built for your grind. Welcome to REAVO, ${userName || 'friend'}.`;
  
  // Parse into tokens: words and image placeholders
  const tokens = [];
  const parts = rawSentence.split(/(\{.*?\})/g);
  
  parts.forEach(part => {
    if (part.startsWith('{') && part.endsWith('}')) {
      tokens.push({ type: 'image', poolIndex: parseInt(part.replace(/[{}]/g, '')) });
    } else {
      const words = part.split(' ').filter(w => w.trim().length > 0);
      words.forEach(word => tokens.push({ type: 'word', text: word }));
    }
  });

  useEffect(() => {
    if (visibleCount < tokens.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 150); // typing speed (ms per token)
      return () => clearTimeout(timer);
    } else {
      // Once done, animate the continue button
      anime({
        targets: '.story-continue-btn',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutSine'
      });
    }
  }, [visibleCount, tokens.length]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-void)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background MeshLLM Visualization */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        <MeshVisualization activeSequence={3} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 1400,
        margin: '0 auto',
        padding: 'clamp(80px, 15vh, 160px) clamp(24px, 6vw, 80px)',
      }}>
        <h1 style={{
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          fontSize: 'clamp(42px, 7vw, 100px)',
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          margin: 0,
          textWrap: 'balance'
        }}>
          {tokens.map((token, i) => {
            if (i >= visibleCount) return null;
            
            if (token.type === 'image') {
              return (
                <span key={i} className="story-token" style={{ animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <InlineImage poolIndex={token.poolIndex} />
                </span>
              );
            }
            
            return (
              <span 
                key={i} 
                className="story-token"
                style={{ 
                  display: 'inline-block', 
                  marginRight: '0.25em',
                  animation: 'fadeInUp 0.4s ease-out forwards',
                  transition: 'color 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: 'default'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.color = 'var(--accent-purple)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {token.text}
              </span>
            );
          })}
        </h1>

        <button 
          className="story-continue-btn"
          onClick={() => navigate('/home')}
          style={{
            marginTop: '80px',
            display: visibleCount === tokens.length ? 'inline-flex' : 'none',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            padding: '16px 32px',
            borderRadius: '100px',
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 600,
            fontSize: '18px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            opacity: 0,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(124, 92, 255, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--glass-bg)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Enter the Store
          <ArrowRight size={20} />
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
