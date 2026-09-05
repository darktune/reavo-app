import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export default function Counter({ target, prefix = '', suffix = '', duration = 2000, format = false }) {
  const nodeRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!nodeRef.current || hasAnimated) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasAnimated(true);
        const obj = { val: 0 };
        
        anime({
          targets: obj,
          val: target,
          duration: duration,
          easing: 'easeOutExpo',
          update: () => {
            if (nodeRef.current) {
              const currentVal = Math.floor(obj.val);
              const formatted = format ? currentVal.toLocaleString() : currentVal;
              nodeRef.current.textContent = `${prefix}${formatted}${suffix}`;
            }
          }
        });

        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(nodeRef.current);
    
    return () => observer.disconnect();
  }, [target, prefix, suffix, duration, format, hasAnimated]);

  return <span ref={nodeRef}>{prefix}0{suffix}</span>;
}
