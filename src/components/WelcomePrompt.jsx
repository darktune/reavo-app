import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, X } from 'lucide-react';
import anime from 'animejs';

const universities = [
  { value: '', label: 'Select your university' },
  { value: 'UNILAG', label: 'University of Lagos (UNILAG)' },
  { value: 'LASU', label: 'Lagos State University (LASU)' },
  { value: 'Covenant', label: 'Covenant University' },
  { value: 'Babcock', label: 'Babcock University' },
  { value: 'UI', label: 'University of Ibadan (UI)' },
  { value: 'FUTA', label: 'Federal University of Technology, Akure (FUTA)' },
  { value: 'Other', label: 'Other' },
];

export default function WelcomePrompt() {
  const routeLocation = useLocation();
  const isAdmin = routeLocation.pathname.startsWith('/admin');
  const { isAuthenticated } = useAuth();

  const { hasSeenIntro, showWelcomePrompt, completeIntro, skipIntro, setShowWelcomePrompt } = useUser();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [location, setLocation] = useState('');
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-show after 8 seconds on first visit (only if never seen intro, not on admin, and not already logged in)
  useEffect(() => {
    if (isAdmin || isAuthenticated) return;
    if (hasSeenIntro && !showWelcomePrompt) return;

    if (showWelcomePrompt) {
      // Manually triggered (from stranger link)
      setVisible(true);
      return;
    }

    // First visit auto-trigger
    const timer = setTimeout(() => {
      setVisible(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasSeenIntro, showWelcomePrompt, isAdmin]);

  // Animate in when visible
  useEffect(() => {
    if (!visible) return;

    if (overlayRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }

    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [60, 0],
        scale: [0.95, 1],
        duration: 700,
        delay: 200,
        easing: 'easeOutCubic',
      });
    }

    // Focus name input after animation
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 600);
  }, [visible]);

  const animateOut = (callback) => {
    anime({
      targets: cardRef.current,
      opacity: [1, 0],
      translateY: [0, 40],
      scale: [1, 0.96],
      duration: 400,
      easing: 'easeInQuad',
    });
    anime({
      targets: overlayRef.current,
      opacity: [1, 0],
      duration: 400,
      delay: 100,
      easing: 'easeInQuad',
      complete: callback,
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const finalSchool = school === 'Other' ? customSchool.trim() : school;
    animateOut(() => {
      completeIntro(name.trim(), finalSchool, location.trim());
      setVisible(false);
    });
  };

  const handleSkip = () => {
    animateOut(() => {
      // If manually opened (from stranger link), just close without re-skipping
      if (showWelcomePrompt) {
        setShowWelcomePrompt(false);
      } else {
        skipIntro();
      }
      setVisible(false);
    });
  };

  // Don't render if already seen and not manually triggered
  if (!visible) return null;

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box',
  };

  const inputFocusHandlers = {
    onFocus: (e) => {
      e.target.style.borderColor = 'var(--accent-primary)';
      e.target.style.boxShadow = '0 0 0 3px rgba(57, 217, 196, 0.15)';
    },
    onBlur: (e) => {
      e.target.style.borderColor = 'rgba(255,255,255,0.12)';
      e.target.style.boxShadow = 'none';
    },
  };

  if (isAdmin || isAuthenticated || !visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleSkip(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        opacity: 0,
      }}
    >
      <form
        ref={cardRef}
        onSubmit={handleContinue}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          background: 'rgba(12, 12, 12, 0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 0 80px rgba(124, 92, 255, 0.15), 0 0 160px rgba(57, 217, 196, 0.08), 0 24px 80px rgba(0,0,0,0.5)',
          opacity: 0,
          overflow: 'hidden',
        }}
      >
        {/* Radial glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(124, 92, 255, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Close button */}
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <X size={16} />
        </button>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary, rgba(255,255,255,0.45))',
          margin: '0 0 20px 0',
          position: 'relative',
        }}>
          Tell us about yourself
        </p>

        {/* Hi ________ — The preserved beautiful design */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2em' }}>
            <span style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(48px, 8vw, 72px)',
              letterSpacing: '-0.04em',
              color: '#fff',
              lineHeight: 1,
            }}>
              Hi
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="________"
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(48px, 8vw, 72px)',
                letterSpacing: '-0.04em',
                color: '#fff',
                background: 'transparent',
                border: 'none',
                borderBottom: '3px dashed var(--accent-purple, #7C5CFF)',
                outline: 'none',
                width: name ? `${Math.max(name.length, 3)}ch` : '5ch',
                transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                lineHeight: 1,
                padding: '0 4px',
                minWidth: '3ch',
              }}
            />
          </div>
        </div>

        {/* University & Location fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28, position: 'relative' }}>
          {/* University dropdown */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 6,
              letterSpacing: '0.02em',
            }}>
              Your University
            </label>
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 40,
              }}
              {...inputFocusHandlers}
            >
              {universities.map(u => (
                <option key={u.value} value={u.value} style={{ background: '#111', color: '#fff' }}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom school input (when "Other" selected) */}
          {school === 'Other' && (
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 6,
              }}>
                School Name
              </label>
              <input
                type="text"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                placeholder="Enter your school name"
                style={inputStyle}
                {...inputFocusHandlers}
              />
            </div>
          )}

          {/* City / Location */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 6,
              letterSpacing: '0.02em',
            }}>
              Your City
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Ibadan, Akure"
              style={inputStyle}
              {...inputFocusHandlers}
            />
          </div>
        </div>

        {/* Action buttons — Skip is clearly visible alongside Continue */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: 100,
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Skip for now
          </button>

          <button
            type="submit"
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: 100,
              border: 'none',
              background: 'var(--accent-primary, #39D9C4)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(57, 217, 196, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
