import { useEffect, useRef, useState } from 'react';

// Two overlapping passes, because a real highlighter crosses its own stroke —
// that is what gives the darker seam and the uneven, rounded ends. A plain
// rectangle reads as a CSS box sitting behind the words instead of ink on top.
// Carried as a background image rather than a positioned SVG so the ink splits
// correctly when the phrase wraps mid-sentence (see box-decoration-break below).
const markerBackground = (color) => {
  const c = encodeURIComponent(color);
  const svg =
    `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 48' preserveAspectRatio='none'%3E` +
    `%3Cpath d='M3 29 C 78 20, 152 33, 226 21 S 374 29, 397 19' fill='none' stroke='${c}' stroke-width='33' stroke-linecap='round' opacity='.88'/%3E` +
    `%3Cpath d='M9 36 C 99 28, 171 40, 248 29 S 368 35, 392 27' fill='none' stroke='${c}' stroke-width='18' stroke-linecap='round' opacity='.45'/%3E` +
    `%3C/svg%3E`;
  return `url("data:image/svg+xml,${svg}")`;
};

export default function Highlighter({
  children,
  color = '#EEE5BC',
  className = '',
  delay = 0,
  duration = 820,
  // Height of the ink band, in em so it tracks font size rather than the line
  // box — otherwise generous leading would stretch it far past the letters.
  thickness = '0.95em',
}) {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    // Someone who asked for less motion still gets the highlight, just not the swipe.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInstant(true);
      setDrawn(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        observer.disconnect(); // swipe once; re-running on every scroll past gets tiring
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        backgroundImage: markerBackground(color),
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: `${drawn ? '100%' : '0%'} ${thickness}`,
        // Negative margin cancels the padding, so the ink overshoots the words
        // like marker does without nudging the surrounding sentence.
        padding: '0 0.14em',
        margin: '0 -0.14em',
        // Each line fragment gets its own stroke instead of one box spanning the wrap.
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        transition: instant ? 'none' : `background-size ${duration}ms cubic-bezier(.42,.1,.28,1) ${delay}ms`,
      }}
    >
      {children}
    </span>
  );
}
