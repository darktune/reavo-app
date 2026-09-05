import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { ArrowRight } from 'lucide-react';
import anime from 'animejs';

export default function IntroPage() {
  const [name, setName] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { completeIntro, hasSeenIntro } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // If they already saw it, they can skip or we can force them. Let's just let them see it if they manually go to '/'
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // Animate out
      anime({
        targets: containerRef.current,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 600,
        easing: 'easeInQuad',
        complete: () => {
          completeIntro(name.trim());
          navigate('/story');
        }
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, var(--accent-purple) 0%, transparent 60%)',
        opacity: 0.1,
        pointerEvents: 'none'
      }}></div>

      <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: '2vw' }}>
        <span style={{
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          fontSize: 'clamp(60px, 8vw, 120px)',
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          lineHeight: 1
        }}>
          Hi
        </span>
        
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 700,
              fontSize: 'clamp(60px, 8vw, 120px)',
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              borderBottom: '3px dashed var(--border-active)',
              outline: 'none',
              width: name ? `${Math.max(name.length, 3)}ch` : '8ch',
              transition: 'width 0.2s',
              lineHeight: 1,
              padding: '0 8px'
            }}
            placeholder="________"
          />
          
          {name.trim() && (
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                position: 'absolute',
                right: -64,
                top: '50%',
                transform: `translateY(-50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                opacity: isHovered ? 1 : 0.8
              }}
            >
              <ArrowRight size={24} />
            </button>
          )}
        </div>
      </form>

      <div style={{
        position: 'absolute',
        bottom: 40,
        fontFamily: 'JetBrains Mono',
        fontSize: 11,
        letterSpacing: '0.1em',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase'
      }}>
        Press Enter to continue
      </div>
    </div>
  );
}
