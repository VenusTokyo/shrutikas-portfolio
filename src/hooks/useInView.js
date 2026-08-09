import { useEffect, useRef, useState } from 'react';

/**
 * Fires once, the first time the element scrolls into view. Returns
 * { ref, inView, reduced }; attach the ref to the element to watch.
 *
 * Under prefers-reduced-motion it reports `inView` straight away and sets
 * `reduced`, so callers can skip the transition without ever hiding the content
 * from someone who asked for less movement.
 */
export function useInView({ threshold = 0.3, rootMargin = '0px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect(); // play once; replaying on every scroll past gets tiring
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView, reduced };
}
