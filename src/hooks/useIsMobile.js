import { useEffect, useState } from 'react';

/**
 * True below the given width. For layout that CSS alone cannot express — the
 * scattered sections position art from coordinate arrays, and picking a
 * different set of numbers is a JS decision, not a class swap.
 *
 * Starts false so the server and the first client render agree; the real value
 * lands on mount.
 */
export function useIsMobile(maxWidth = 767) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [maxWidth]);

  return isMobile;
}
