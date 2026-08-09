import { useEffect, useState, useRef } from 'react';
import { measureBlock } from '@/lib/pretext-measure';

/**
 * Measures the rendered height of a text block at its container's current width
 * using @chenglou/pretext. Returns { ref, height, lineCount }. The ref must be
 * attached to the container whose width should be observed.
 */
export function useTextLayout({ text, font, lineHeight = 20, options }) {
  const ref = useRef(null);
  const [result, setResult] = useState({ height: 0, lineCount: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (!width) return;
      try {
        const r = measureBlock(text, font, width, lineHeight, options);
        setResult({ height: r.height, lineCount: r.lineCount });
      } catch {
        // pretext can throw on degenerate inputs; fall back silently
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, font, lineHeight, options]);

  return { ref, ...result };
}
