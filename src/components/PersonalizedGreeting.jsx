import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Link2 } from 'lucide-react';

/**
 * PersonalizedGreeting — A reusable smart greeting component.
 *
 * Three states:
 * 1. User has a name → "Welcome back, {name}" (no animation after first render)
 * 2. Skipped intro, < 5 pages → "Hi, you can be our guest" (typing animation)
 * 3. Skipped intro, ≥ 5 pages → "Hi, we didn't get your name, stranger 😊" + link icon (typing animation)
 *
 * Props:
 *   - variant: 'hero' | 'inline' (default 'inline')
 *     - hero: larger text, used on landing page
 *     - inline: smaller, used in navbars or cards
 */
export default function PersonalizedGreeting({ variant = 'inline' }) {
  const { userName, skippedIntro, pageVisitCount, openWelcomePrompt } = useUser();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const animationRef = useRef(null);
  const hasAnimated = useRef(false);

  // Determine which message to show
  let message = '';
  let shouldAnimate = false;
  let shouldShowLink = false;

  if (userName) {
    message = `Welcome back, `;
    shouldAnimate = false;
  } else if (skippedIntro && pageVisitCount >= 5) {
    message = `Hi, we didn't get your name, stranger 😊`;
    shouldAnimate = true;
    shouldShowLink = true;
  } else if (skippedIntro) {
    message = `Hi, you can be our guest`;
    shouldAnimate = true;
  }

  // Determine if greeting should render
  const shouldRender = Boolean(userName || skippedIntro);

  useEffect(() => {
    // Clear previous animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    // If already animated this message, skip
    if (!shouldAnimate || hasAnimated.current) {
      setDisplayedText(message);
      setIsTyping(false);
      if (shouldShowLink) setShowLink(true);
      return;
    }

    // Typing animation
    setIsTyping(true);
    setDisplayedText('');
    setShowLink(false);
    let charIndex = 0;

    const typeNextChar = () => {
      if (charIndex < message.length) {
        setDisplayedText(message.slice(0, charIndex + 1));
        charIndex++;
        animationRef.current = setTimeout(typeNextChar, 35 + Math.random() * 25);
      } else {
        setIsTyping(false);
        hasAnimated.current = true;
        if (shouldShowLink) {
          setTimeout(() => setShowLink(true), 300);
        }
      }
    };

    // Small delay before starting
    animationRef.current = setTimeout(typeNextChar, 500);

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [message, shouldAnimate, shouldShowLink]);

  const isHero = variant === 'hero';

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: isHero ? 13 : 12,
    color: 'var(--text-secondary, rgba(255,255,255,0.5))',
    letterSpacing: '0.01em',
    position: 'relative',
  };

  // Cursor blink for typing animation
  const cursorStyle = {
    display: isTyping ? 'inline-block' : 'none',
    width: 2,
    height: '1.1em',
    background: 'var(--accent-primary, #39D9C4)',
    marginLeft: 2,
    animation: 'cursorBlink 0.8s step-end infinite',
    verticalAlign: 'middle',
  };

  // Unique gradient ranging from electric purple into rose/pink and cyan
  const nameHighlightStyle = {
    fontWeight: 700,
    background: 'linear-gradient(135deg, #C084FC 0%, #F472B6 55%, #38BDF8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: '#C084FC',
    textShadow: '0 0 12px rgba(192, 132, 252, 0.45)',
    display: 'inline',
  };

  const linkIconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(192, 132, 252, 0.15)',
    border: '1px solid rgba(192, 132, 252, 0.35)',
    color: '#C084FC',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    opacity: showLink ? 1 : 0,
    transform: showLink ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-90deg)',
    marginLeft: 6,
  };

  // Helper to highlight userName, stranger, or guest with the unique hue
  const renderGreetingContent = () => {
    if (userName) {
      return (
        <>
          {displayedText}
          <strong style={nameHighlightStyle}>
            {userName}
          </strong>
        </>
      );
    }

    // Split by stranger or guest to highlight the keyword with unique color
    const parts = displayedText.split(/(stranger|guest)/gi);
    if (parts.length === 1) {
      return displayedText;
    }

    return parts.map((part, index) => {
      const lower = part.toLowerCase();
      if (lower === 'stranger' || lower === 'guest') {
        return (
          <strong key={index} style={nameHighlightStyle}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  if (!shouldRender) return null;

  return (
    <>
      <span style={containerStyle}>
        <span>
          {renderGreetingContent()}
          <span style={cursorStyle} />
        </span>

        {/* Link icon — leads to the WelcomePrompt */}
        {shouldShowLink && (
          <span
            role="button"
            tabIndex={0}
            title="Tell us your name"
            onClick={openWelcomePrompt}
            onKeyDown={(e) => { if (e.key === 'Enter') openWelcomePrompt(); }}
            style={linkIconStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(192, 132, 252, 0.3)';
              e.currentTarget.style.transform = 'scale(1.15)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(192, 132, 252, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(192, 132, 252, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Link2 size={12} />
          </span>
        )}
      </span>

      {/* Keyframe for cursor blink */}
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
