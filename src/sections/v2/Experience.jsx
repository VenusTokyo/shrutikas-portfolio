import { useEffect, useState } from 'react';
import Image from 'next/image';
import Section from './Section';
import RoleNote from './RoleNote';
import { useInView } from '../../hooks/useInView';
import { useIsMobile } from '../../hooks/useIsMobile';

// The trail is 37 separate dashes rather than one continuous stroke, so a
// directional wipe pops them in sequence and reads as the path drawing itself.
//
// 'to top left' keeps the sweep corner-to-corner at any aspect ratio: the 0%
// (opaque) end sits at the bottom-right, the transparent end at the top-left.
// Oversizing the mask leaves slack to slide it — parked at 0% 0% the image sits
// under the transparent end and is hidden; at 100% 100% it sits under the
// opaque end. In between, the edge travels in from the bottom-right corner.
const MASK = 'linear-gradient(to top left, #000 0%, #000 47%, transparent 53%, transparent 100%)';
const MASK_SIZE = '220% 220%';
const REVEAL_MS = 5000;
const EASE = 'cubic-bezier(.33,.1,.25,1)';

// x/y are percentages of path.svg's 1928x900 box, so they track the artwork at
// any width. Each pair was picked to land on an actual dash of the trail — the
// pin's tip is anchored here, which is what makes it sit *on* the path rather
// than near it. Spaced 19 points apart across the width.
// logoScale nudges each mark off the shared base height. Equal heights are the
// right starting point, but the two artworks carry different amounts of internal
// padding, so they need trimming to look evenly weighted.
const ABEKUS_LOGO = { logo: '/abekus_logo_blue.svg', logoW: 143, logoH: 33, logoScale: 0.85 };
const BUILDSHIP_LOGO = { logo: '/BuildShip.png', logoW: 417, logoH: 106, logoScale: 1.3 };

const STOPS = [
  {
    company: 'Abekus',
    role: 'Software Engineer',
    dates: 'Nov 2025 - Present',
    x: 8,
    y: 28.5,
    ...ABEKUS_LOGO,
    blurb: 'Where she grew from an intern into a product-minded engineer.',
    body: 'Moved up from the full stack internship into an engineering role, working across the whole product. Building features turned into helping shape the decisions behind them — user experience and technical direction alike.',
    highlights: [
      'Frontend across web platforms',
      'Mobile application development',
      'Backend systems and APIs',
      'Product design and feature planning',
      'Work with designers, marketers and leadership',
    ],
    note: 'Great software is not just writing code — it is solving real problems, then asking how to make them better.',
  },
  {
    company: 'Buildship',
    role: 'Software Engineer Intern',
    dates: 'Oct 2025',
    x: 42,
    y: 67.5,
    ...BUILDSHIP_LOGO,
    blurb: 'A short chapter, but one that left a lasting impression.',
    body: 'Brief but valuable exposure to a globally distributed team, and to how modern products get built and refined at scale.',
    highlights: [
      'Brainstormed product improvements',
      'Analysed onboarding experiences',
      'Ideas for activation and retention',
      'Product strategy and growth discussions',
    ],
    note: 'So much thought and iteration happens behind every feature users actually see.',
  },
  {
    company: 'Abekus',
    role: 'Full Stack Engineer Intern',
    dates: 'Feb 2025 - Sep 2025',
    x: 75,
    y: 72,
    ...ABEKUS_LOGO,
    blurb: 'Joined during rapid growth, and got to touch nearly everything.',
    body: 'Contributed across several domains rather than one narrow role. Every week brought a different challenge — refining an interface one day, debugging backend logic or arguing product strategy the next.',
    highlights: [
      'React and modern frontend',
      'Backend APIs and integrations',
      'Internal tools and improvements',
      'UI/UX implementation',
    ],
    note: 'Being an all-rounder is not knowing everything. It is being willing to learn whatever the product needs.',
  },
];

// Workplaces reveal on a fixed rhythm in list order, deliberately independent of
// where each pin sits on the map — an even beat reads as a list being ticked off,
// whereas cueing off map position made the gaps uneven and the order arbitrary.
const STOP_START_MS = 700; // before the first pin
const STOP_STAGGER_MS = 900; // between each one after

// Map scenery. Same percentage space as the stops above, centred on x/y, with
// `size` as a percentage of the map's width so everything scales with the
// artwork instead of drifting out of place at other viewport widths.
//
// Positions were chosen against the trail's dash coordinates and the pins' text
// blocks, so the scenery fills the empty water rather than sitting on the route.
// The bottom strip below y≈66% on the left is left clear for the Experience
// title, which renders about 1000x265 in that corner.
const DECOR = [
  { src: '/Compass.png', iw: 232, ih: 253, x: 92, y: 11, size: 7 },

  { src: '/Mountains1.png', iw: 566, ih: 197, x: 55, y: 16, size: 13 },
  { src: '/Mountains2.png', iw: 519, ih: 161, x: 86, y: 33, size: 11 },
  { src: '/Trees3.png', iw: 560, ih: 440, x: 64, y: 40, size: 10 },
  { src: '/Trees2.png', iw: 354, ih: 276, x: 25, y: 20, size: 7 },
  { src: '/Ship.png', iw: 543, ih: 367, x: 30, y: 68, size: 11 },

  // Scattered swells, tilted and faded a little so they read as sea texture
  // rather than as repeated stamps of the same asset.
  { src: '/Wave1.png', iw: 283, ih: 91, x: 79, y: 20, size: 6, rotate: -4, opacity: 0.75 },
  { src: '/Wave1.png', iw: 283, ih: 91, x: 11, y: 39, size: 6, rotate: 3, opacity: 0.7 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 44, y: 27, size: 4, rotate: -2, opacity: 0.8 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 88, y: 48, size: 4, rotate: 4, opacity: 0.7 },
  { src: '/WaveSmall2.png', iw: 189, ih: 40, x: 70, y: 12, size: 4.5, rotate: 3, opacity: 0.75 },
  { src: '/WaveSmall2.png', iw: 189, ih: 40, x: 33, y: 57, size: 4.5, rotate: -3, opacity: 0.7 },

  // Second pass of swells filling the remaining open water. Rotation and opacity
  // vary per instance so the repeats don't line up into a visible pattern.
  { src: '/Wave1.png', iw: 283, ih: 91, x: 30, y: 36, size: 6, rotate: -5, opacity: 0.65 },
  { src: '/Wave1.png', iw: 283, ih: 91, x: 70, y: 52, size: 6, rotate: 2, opacity: 0.6 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 20, y: 47, size: 4, rotate: 5, opacity: 0.7 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 58, y: 25, size: 4, rotate: -3, opacity: 0.65 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 94, y: 42, size: 4, rotate: 6, opacity: 0.6 },
  { src: '/WaveSmall1.png', iw: 150, ih: 29, x: 48, y: 47, size: 4, rotate: -6, opacity: 0.7 },
  { src: '/WaveSmall2.png', iw: 189, ih: 40, x: 17, y: 60, size: 4.5, rotate: 4, opacity: 0.65 },
  { src: '/WaveSmall2.png', iw: 189, ih: 40, x: 52, y: 35, size: 4.5, rotate: -4, opacity: 0.7 },
  { src: '/WaveSmall2.png', iw: 189, ih: 40, x: 5, y: 62, size: 4.5, rotate: 5, opacity: 0.6 },

  // Sea life. Left at full opacity — unlike the waves these are details worth
  // noticing, not background texture. Filenames are case-sensitive on deploy:
  // Whale is capitalised, the rest are not.
  { src: '/Whale.png', iw: 307, ih: 123, x: 89, y: 82, size: 16, rotate: -3 },
  { src: '/stingray.png', iw: 66, ih: 60, x: 80, y: 8, size: 3, rotate: 8 },
  { src: '/shell1.png', iw: 96, ih: 90, x: 60, y: 70, size: 3, rotate: -12 },
  { src: '/shell2.png', iw: 86, ih: 78, x: 17, y: 54, size: 2.8, rotate: 15 },
];

// How far the map recedes while a note is open. Not zero — the route staying
// faintly visible keeps the note anchored to the place it came from.
const MAP_DIMMED = 0.12;
const DIM_MS = 420;

// On a phone the map is turned a quarter turn clockwise so the journey runs down
// the screen instead of across it. Rotating an image by 90deg swaps which of its
// own edges faces which way, so a point at (x, y) in the artwork lands at
// (100 - y, x) once turned — that one line keeps the pins, their text and every
// piece of scenery in register with the trail without a second set of
// coordinates to maintain.
const turned = ({ x, y, ...rest }) => ({ ...rest, x: 100 - y, y: x });

// Sized off the viewport height, since after the turn the artwork is taller than
// it is wide: 1928 x 900 becomes 900 x 1928, far too tall to fit by width.
const MAP_TALL_VH = 88;
const MAP_WIDE_VH = (MAP_TALL_VH * 900) / 1928;

export default function Experience() {
  const { ref, inView, reduced } = useInView({ threshold: 0.35 });
  const isMobile = useIsMobile();

  // Hover opens a note; a click pins it so it survives the pointer leaving,
  // which is also the only way this works on touch.
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const activeIndex = pinned ?? hovered;
  const isOpen = activeIndex !== null;

  // Keep showing the last opened stop through the close animation, otherwise the
  // text disappears the instant it starts rolling back up.
  const [lastIndex, setLastIndex] = useState(0);
  useEffect(() => {
    if (activeIndex !== null) setLastIndex(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (pinned === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setPinned(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  const toggle = (i) => setPinned((p) => (p === i ? null : i));

  const position = inView ? '100% 100%' : '0% 0%';
  const maskTransition = reduced
    ? 'none'
    : `mask-position ${REVEAL_MS}ms ${EASE}, -webkit-mask-position ${REVEAL_MS}ms ${EASE}`;
  const mapDim = isOpen ? MAP_DIMMED : 1;

  // Everything positioned on the map goes through this, so the turn is applied
  // in exactly one place.
  const at = (o) => (isMobile ? turned(o) : o);

  return (
    <Section id="experience" height="h-[120dvh]">
      <div className="relative w-full h-full">
        {/* Breaks out of the Section's side margins: 100vw pinned to the parent's
            centre lands on the viewport edges, since those margins are symmetric.
            The trail image (a static child) sets this box's height, so the pins
            below can position against it in the artwork's own coordinates.
            Turned sideways the box is driven off viewport height instead. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={
            isMobile
              ? { width: `${MAP_WIDE_VH}vh`, height: `${MAP_TALL_VH}vh` }
              : { width: '100vw' }
          }
        >
          {/* Scenery sits under the route. Positioned elements paint above static
              ones regardless of source order, so the trail below needs an explicit
              layer to stay on top of this rather than under it. */}
          {DECOR.map((raw, i) => {
            // Repositioned by the turn but never rotated with it — mountains and
            // waves have an up, and a sideways sea reads as a mistake.
            const d = at(raw);
            return (
            <div
              key={`${raw.src}-${raw.x}-${raw.y}`}
              className="absolute z-0"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                // Width is a share of the box, which is narrow once turned, so
                // scenery is scaled up to stay legible against the taller map.
                width: `${d.size * (isMobile ? 2.1 : 1)}%`,
                transform: `translate(-50%, -50%) rotate(${d.rotate ?? 0}deg)`,
                opacity: inView ? (d.opacity ?? 1) * mapDim : 0,
                // Scenery washes in first so the route has a map to draw across.
                // Once a note opens it recedes fast, with no per-item stagger —
                // a ripple across 25 items would read as a glitch, not a fade.
                transition: reduced
                  ? 'none'
                  : isOpen
                    ? `opacity ${DIM_MS}ms ease-out`
                    : `opacity 700ms ease-out ${i * 60}ms`,
              }}
            >
              {/* The map box is exactly 100vw, so an item's `size` percentage is
                  its viewport width — telling next/image that lets it serve a
                  correctly scaled WebP instead of the full-resolution file. */}
              <Image
                src={d.src}
                alt=""
                width={d.iw}
                height={d.ih}
                sizes={`${d.size}vw`}
                className="h-auto w-full"
              />
            </div>
            );
          })}

          <div
            ref={ref}
            className={isMobile ? 'absolute inset-0 z-10' : 'relative z-10'}
            style={{
              maskImage: MASK,
              WebkitMaskImage: MASK,
              maskSize: MASK_SIZE,
              WebkitMaskSize: MASK_SIZE,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: position,
              WebkitMaskPosition: position,
              opacity: mapDim,
              transition: `${maskTransition}${reduced ? '' : `, opacity ${DIM_MS}ms ease-out`}`,
            }}
          >
            {/* Turned about its own centre. Width is set pre-rotation, so the
                88vh below becomes the trail's vertical run once it is on its
                side, and the box around it is already that shape. */}
            <Image
              src="/path.svg"
              alt=""
              width={1928}
              height={900}
              className={
                isMobile
                  ? 'absolute left-1/2 top-1/2 h-auto max-w-none opacity-30'
                  : 'h-auto w-full opacity-30'
              }
              style={
                isMobile
                  ? {
                      width: `${MAP_TALL_VH}vh`,
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                    }
                  : undefined
              }
            />
          </div>

          {STOPS.map((rawStop, i) => {
            const stop = at(rawStop);
            // Reversed: the last entry goes first, so the reveal runs oldest to
            // most recent and finishes on the current role.
            const step = STOPS.length - 1 - i;
            const delay = reduced ? 0 : STOP_START_MS + step * STOP_STAGGER_MS;
            const pinTransition = reduced
              ? 'none'
              : `opacity 400ms ease-out ${delay}ms, transform 520ms cubic-bezier(.34,1.45,.5,1) ${delay}ms`;
            // Text follows its pin in rather than arriving with it.
            const textTransition = reduced
              ? 'none'
              : `opacity 460ms ease-out ${delay + 190}ms, transform 460ms cubic-bezier(.33,.1,.25,1) ${delay + 190}ms`;

            const isActive = activeIndex === i;
            // Everything for this stop reacts to the same pointer/focus events,
            // so hovering the pin or its label opens the same note.
            const handlers = {
              onMouseEnter: () => setHovered(i),
              onMouseLeave: () => setHovered((h) => (h === i ? null : h)),
              onFocus: () => setHovered(i),
              onBlur: () => setHovered((h) => (h === i ? null : h)),
              onClick: () => toggle(i),
            };

            return (
              <div key={`${rawStop.company}-${rawStop.dates}`}>
                {/* -100% puts the pin's tip, not its centre, on the trail point. */}
                <div className="absolute z-20" style={{ left: `${stop.x}%`, top: `${stop.y}%`, transform: 'translate(-50%, -100%)' }}>
                  <div
                    className="pointer-events-auto cursor-pointer"
                    {...handlers}
                    style={{
                      transformOrigin: 'bottom center',
                      opacity: inView ? 1 : 0,
                      transform: inView ? `scale(${isActive ? 1.15 : 1})` : 'scale(0.55)',
                      transition: pinTransition,
                    }}
                  >
                    <Image
                      src="/MapPin.svg"
                      alt=""
                      width={134}
                      height={216}
                      className="w-7 sm:w-9 md:w-12"
                    />
                  </div>
                </div>

                {/* Shares the pin's baseline so the text sits beside it, clearing
                    the pin's half-width plus a gap. A button so the notes are
                    reachable by keyboard, not just by pointer. */}
                <div className="absolute z-20" style={{ left: `${stop.x}%`, top: `${stop.y}%`, transform: 'translate(0, -100%)' }}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    {...handlers}
                    className="pointer-events-auto ml-5 whitespace-nowrap text-left font-gochi leading-tight sm:ml-7 md:ml-9"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translateY(0)' : 'translateY(0.5rem)',
                      transition: textTransition,
                    }}
                  >
                    <span className="block text-lg text-navy-dark sm:text-2xl md:text-4xl">{stop.company}</span>
                    <span className="block text-sm text-navy-dark sm:text-lg md:text-xl">{stop.role}</span>
                    <span className="block text-[0.65rem] text-charcoal sm:text-xs md:text-sm">{stop.dates}</span>
                  </button>
                </div>
              </div>
            );
          })}

          <RoleNote
            stop={STOPS[activeIndex ?? lastIndex]}
            open={isOpen}
            reduced={reduced}
            pinned={pinned !== null}
            onClose={() => setPinned(null)}
          />
        </div>

        <Image
          src="/Experience.svg"
          alt="Experience"
          width={1000}
          height={450}
          className="absolute z-2 bottom-0"
        />
      </div>
    </Section>
  );
}
