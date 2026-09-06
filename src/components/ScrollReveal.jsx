import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.localStorage.getItem('reavo_skip_loader') === 'true');

    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.style.opacity = 1;
        ref.current.style.transform = 'none';
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target,
              opacity: [0, 1],
              translateY: [22, 0],
              duration: 650,
              easing: 'easeOutCubic',
              delay: delay
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      // Set initial state
      ref.current.style.opacity = 0;
      ref.current.style.transform = 'translateY(22px)';
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
