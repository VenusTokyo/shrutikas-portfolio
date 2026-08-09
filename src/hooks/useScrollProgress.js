import { useEffect, useRef, useState } from 'react';

/**
 * Progress from 0 to 1 as an over-tall element scrolls past a pinned viewport.
 * Pair it with an inner `sticky top-0 h-screen` child: the extra height is the
 * scroll runway, and the sticky child stays on screen while it is consumed.
 *
 * `startOffset` is how far ahead of arrival to begin counting, in viewport
 * heights — 0 starts only once the element's top reaches the top of the screen,
 * 1 starts the moment it first appears at the bottom. On a snapping page the
 * approach is a single jump, so anything driven purely by the runway sits at 0
 * until after you have landed; counting the approach is what lets an animation
 * play while the section is still coming in.
 *
 * Returns { ref, progress, reduced }.
 */
export function useScrollProgress({ startOffset = 0 } = {}) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Nothing to play out — park it at the finished state.
      setReduced(true);
      setProgress(1);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Counting starts once the top has climbed to `lead` above the fold, and
      // finishes when the runway below the fold is used up.
      const lead = startOffset * vh;
      const span = lead + Math.max(0, rect.height - vh);
      if (span <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, (lead - rect.top) / span)));
    };

    // Coalesce onto a frame: a trackpad can fire scroll far faster than paint,
    // and each read here forces layout.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [startOffset]);

  return { ref, progress, reduced };
}
