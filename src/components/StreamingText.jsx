import { useState, useEffect, useRef } from 'react';

export default function StreamingText({ text, speed = 40, delay = 0, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!text) return;

    // Reset state when text changes
    setDisplayedText('');
    indexRef.current = 0;
    setIsTyping(false);

    let timeout;
    let typingInterval;

    const startTyping = () => {
      setIsTyping(true);
      typingInterval = setInterval(() => {
        if (indexRef.current >= text.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
          if (onCompleteRef.current) setTimeout(onCompleteRef.current, 500);
          return;
        }
        
        const nextChar = text[indexRef.current];
        indexRef.current++;
        
        setDisplayedText((prev) => {
          if (prev.length >= text.length) return prev;
          return prev + nextChar;
        });
      }, speed);
    };

    if (delay > 0) {
      timeout = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(typingInterval);
    };
  }, [text, speed, delay]);

  return (
    <span style={{ position: 'relative' }}>
      {displayedText}
      {isTyping && (
        <span style={{ 
          display: 'inline-block', 
          width: '0.6ch', 
          height: '1em', 
          backgroundColor: 'currentColor', 
          marginLeft: 4,
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite'
        }} />
      )}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
