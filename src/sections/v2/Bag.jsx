import { useState } from 'react';
import Image from 'next/image';
import Section from './Section';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useIsMobile } from '../../hooks/useIsMobile';

const BAG_TITLE = { src: '/whatinherbag.png', w: 2409, h: 841 };

// Width is applied before the rotation, so this 90vh is what becomes the banner's
// vertical run once it is turned on its side.
const WIDTH_VH = 90;

// Rotating about the centre keeps the centre put, so the element's visual box
// shrinks from 90vh wide to just its own height — leaving it stranded well short
// of the right edge. Shifting by half that difference puts it flush again.
const VISUAL_WIDTH_VH = (WIDTH_VH * BAG_TITLE.h) / BAG_TITLE.w;
const FLUSH_RIGHT_VH = (WIDTH_VH - VISUAL_WIDTH_VH) / 2;

const DIR = '/whatsinmybag';

// The tote sits bottom-left; x/y are percentages of the pinned scene, `size` a
// percentage of its width, so the whole arrangement scales with the viewport.
// `m` overrides those on a phone: the bag grows and hangs off the left edge,
// which buys back the width the items need on a narrow screen.
const TOTE = {
  src: `${DIR}/ToteBag.png`,
  w: 926,
  h: 1161,
  x: 10,
  y: 64,
  size: 22,
  m: { x: 2, y: 76, size: 48 },
};

// Everything spills from the mouth of the bag rather than its centre.
const MOUTH = { x: 10, y: 54 };
const MOUTH_M = { x: 4, y: 60 };

// Resting places, chosen to clear the tote (x < 25) and the vertical banner
// pinned to the right edge (x > 80). `delay` staggers each item's launch across
// the first part of the scroll so they tumble out one after another.
// `label` appears on hover. Froggie carries `pinned`, which keeps its caption up
// permanently — it is the one that earns a standing introduction.
// `m` carries the phone arrangement: sizes roughly double as a share of a much
// narrower screen, and everything shifts up and right to clear the enlarged tote
// in the bottom-left and the heading along the bottom.
const ITEMS = [
  { src: `${DIR}/book.png`, w: 432, h: 321, x: 33, y: 18, size: 16, rot: -12, delay: 0.05, label: 'She likes to pretend she reads', side: 'left', m: { x: 72, y: 7, size: 32 } },
  { src: `${DIR}/candies.png`, w: 500, h: 500, x: 49, y: 12, size: 7, rot: 8, delay: 0.13, label: 'Sugar to keep the day going', side: 'bottom', m: { x: 22, y: 55, size: 15 } },
  { src: `${DIR}/shades.png`, w: 735, h: 233, x: 64, y: 12, size: 13, rot: 5, delay: 0.08, label: 'She thinks shes cool', side: 'bottom', m: { x: 46, y: 24, size: 30 } },
  { src: `${DIR}/clawclip.png`, w: 736, h: 742, x: 34, y: 78, size: 8, rot: -18, delay: 0.17, label: 'Holds it all together', side: 'bottom', m: { x: 82, y: 21, size: 17 } },
  { src: `${DIR}/earbuds.png`, w: 493, h: 637, x: 41, y: 33, size: 6, rot: -8, delay: 0.1, label: 'Walking to her title track', m: { x: 20, y: 29, size: 13 } },
  { src: `${DIR}/lipbalm.png`, w: 293, h: 344, x: 29, y: 38, size: 4.5, rot: 15, delay: 0.15, label: 'Reapplied every four minutes', m: { x: 64, y: 34, size: 10 } },
  { src: `${DIR}/clips.png`, w: 565, h: 562, x: 72, y: 52, size: 6.5, rot: 12, delay: 0.2, label: 'For flyaways', side: 'right', m: { x: 80, y: 40, size: 14 } },
  {
    src: `${DIR}/Froggie.png`,
    w: 1144,
    h: 914,
    x: 56,
    y: 50,
    size: 15,
    rot: 6,
    delay: 0,
    label: 'Emotional support froggie',
    pinned: true,
    side: 'bottom',
    arrowClass: 'w-[20%] min-w-[16px] md:w-[38%] md:min-w-[28px]',
    m: { x: 50, y: 45, size: 34 },
  },
  { src: `${DIR}/lipstick.png`, w: 380, h: 631, x: 36, y: 55, size: 5, rot: -22, delay: 0.18, label: 'The one shade \nthat works', m: { x: 14, y: 41, size: 11 } },
  // \n breaks exactly where you put it.
  { src: `${DIR}/Receipt.png`, w: 449, h: 449, x: 74, y: 76, size: 12, rot: 10, delay: 0.22, label: 'Kept for absolutely\n no reason, until it fades', side: 'right', m: { x: 34, y: 14, size: 24 } },
  { src: `${DIR}/scrunchy.png`, w: 500, h: 500, x: 45, y: 70, size: 7, rot: -14, delay: 0.12, label: 'Lives on her wrist', side: 'bottom', m: { x: 78, y: 58, size: 15 } },
  // labelWidth lets it wrap on its own inside that measure.
  { src: `${DIR}/universe.png`, w: 661, h: 295, x: 74, y: 30, size: 15, rot: -6, delay: 0.07, label: 'An entire galaxy in case of\n any possible cosmic event.', m: { x: 47, y: 66, size: 34 } },
];

// Hand-drawn arrow doodle. The artwork points right at 0deg; rotation is applied
// about the centre of its own viewBox rather than via transform-origin, so it
// stays correct at any rendered size.
const POINTS_UP = 262;
const POINTS_DOWN = 90;
const POINTS_LEFT = 180;
const POINTS_RIGHT = 0;

// Where a caption sits relative to its item. Set `side` on any item to pick one;
// leave it off and the side is chosen from the item's x so it never runs off the
// edge. In every case the arrow is the element nearest the item, pointing back
// at it — the reverse flex directions are what keep that true.
// Offsets tighten on a phone, where the artwork is smaller and a label sitting a
// full step away reads as belonging to nothing in particular.
const CAPTION_SIDES = {
  right: { box: 'left-full top-1/2 -translate-y-1/2 -ml-1 md:ml-1 flex-row', arrow: POINTS_LEFT, align: 'text-left' },
  left: { box: 'right-full top-1/2 -translate-y-1/2 -mr-1 md:mr-1 flex-row-reverse', arrow: POINTS_RIGHT, align: 'text-right' },
  top: { box: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 md:mb-1 flex-col-reverse', arrow: POINTS_DOWN, align: 'text-center' },
  bottom: { box: 'top-full left-1/2 -translate-x-1/2 -mt-1 md:mt-1 flex-col', arrow: POINTS_UP, align: 'text-center' },
};

function Squiggle({ className, rotate = POINTS_UP }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="currentColor" aria-hidden="true">
      <path
        transform={`rotate(${rotate} 250 250)`}
        d="M437.65 228.63c-11-11.3-28.02-30.74-43.85-33.25-13.68.4-4.24 16.99 4.72 15.98 1.67-.27 14.6 12 20.99 18.95-73.13-19.32-152.62-31.59-224.6-2.19-24.36-20.09-70.46-5.55-97.86 2.74-10.7 4.38-44.74 15.3-45.58 27.63 2.63 10.11 14.03 9.62 19.87 2.58 6.8-4.63 14.23-8.1 21.77-11.33 27.16-10.03 57.65-20.38 86.74-14.81-19.75 10.96-45.07 24.46-49.37 48.67-.98 20.42 24.81 26.36 39.14 16.1 18.7-11.31 37.58-31.54 34.51-54.98 67.16-28.65 141.54-17.06 210.28.69a634.53 634.53 0 0 0-26.86 9.82c-4.5 1.55-4.87 7.28-1.98 10.53 6.02 8.29 15.78 3.88 23.3.63 8.17-3.12 16.31-6.28 24.61-9.03 22.39-5.78 16.3-15.12 4.17-28.72Zm-286.98 58.93c4.9-15.45 20.39-24.72 33.42-32.9-6.02 14.67-18.84 26.87-33.42 32.9Z"
      />
    </svg>
  );
}

// Counted in whole screenfuls, not vh: 1.5 screens is 150dvh, matching the
// h-[150dvh] on the Section below. The extra half screen is what gives the spill
// room to play out while the scene travels up the page.
const SECTION_SCREENS = 1.5;

// How far ahead of the section landing to begin measuring, again in screenfuls.
const LEAD_SCREENS = 1;

// Where in that measured window the spill runs, rather than starting at 0. The
// tote sits low in the scene and is still below the fold early on, so beginning
// immediately meant things flew out of a bag nobody could see yet. Waiting until
// the tote is actually on screen is what makes the spill read as coming from it.
//
// Roughly: 0 is the section first appearing from below, 0.67 is its top touching
// the top of the screen, 1 is the runway spent.
const SPILL_FROM = 0.55;
const SPILL_AT = 0.85;
// How high each item arcs on its way out, so they lob rather than slide.
const ARC = 14;
// Anticlockwise lean the tote settles into as it empties. Negative is
// anticlockwise in CSS, where positive rotation runs clockwise.
const TOTE_TILT = 20;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
// Decelerating: things leave the bag fast and settle gently.
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// How much a hovered item grows and cocks its head.
const HOVER_SCALE = 1.16;
const HOVER_ROT = 5;

// An item counts as arrived once its own eased travel passes this, rather than
// waiting for the whole spill to read 1. easeOut approaches its target
// asymptotically, so an item looks parked long before the number gets there —
// gating hover on the full spill left a dead stretch where everything appeared
// settled but nothing answered the pointer.
const LANDED_AT = 0.96;

export default function Bag() {
  const { ref, progress, reduced } = useScrollProgress({ startOffset: LEAD_SCREENS });
  const [hovered, setHovered] = useState(null);
  const isMobile = useIsMobile();

  // One place to resolve the phone overrides, so the spill maths below never has
  // to care which arrangement is in play.
  const place = (o) => (isMobile && o.m ? { ...o, ...o.m } : o);
  const tote = place(TOTE);
  const mouth = isMobile ? MOUTH_M : MOUTH;

  // Rescale the window so the spill occupies SPILL_FROM..SPILL_AT of it, holding
  // at either end outside that range.
  const spill = clamp01((progress - SPILL_FROM) / (SPILL_AT - SPILL_FROM));

  // The height below is spelled out rather than built from SECTION_VH, because
  // Tailwind only generates classes it can see written literally in the source.
  // Keep the two in step.
  return (
    <Section id="bag" height="h-[150dvh]">
      {/* The height above 100dvh is scroll runway; the sticky child is what stays
          on screen while it is consumed. */}
      <div ref={ref} className="relative flex h-full w-full items-center">
        {/* Travels up the page with everything else rather than pinning: the
            scene is one screen tall, centred in the taller section, so the extra
            height reads as breathing room above and below it. */}
        <div className="relative h-screen w-full overflow-hidden">
          {/* Upright along the bottom on a phone: turned on its side it would eat
              most of a narrow screen's width, and the 90vh sizing grows relative
              to a portrait viewport rather than shrinking. */}
          {isMobile ? (
            <div className="pointer-events-none absolute bottom-[3%] right-[3%] w-[80vw]">
              <Image
                src={BAG_TITLE.src}
                alt="What's in her bag"
                width={BAG_TITLE.w}
                height={BAG_TITLE.h}
                sizes="80vw"
                className="h-auto w-full"
              />
            </div>
          ) : (
            /* Cancels the Section's gutter so the banner meets the real viewport
               edge. Only one value now: the gutter is a flat md:px-6, and this
               branch only renders above that breakpoint anyway. */
            <div className="pointer-events-none absolute inset-y-0 right-6 -mr-6 flex items-center">
              <Image
                src={BAG_TITLE.src}
                alt="What's in her bag"
                width={BAG_TITLE.w}
                height={BAG_TITLE.h}
                // max-w-none: preflight caps images at their parent's width, which
                // would clamp 90vh back down on any viewport taller than it is wide.
                className="max-w-none"
                style={{
                  width: `${WIDTH_VH}vh`,
                  height: 'auto',
                  // Rotate first, then slide in screen space — CSS applies the list
                  // right to left.
                  transform: `translateX(${FLUSH_RIGHT_VH}vh) rotate(-90deg)`,
                }}
              />
            </div>
          )}

          {ITEMS.map((raw, i) => {
            const item = place(raw);
            // Each item consumes what is left of the spill after its own delay,
            // so later items are still moving once the earlier ones have landed.
            const t = reduced ? 1 : easeOut(clamp01((spill - item.delay) / (1 - item.delay)));
            const x = lerp(mouth.x, item.x, t);
            // sin peaks at the midpoint and returns to 0, so the arc adds lift on
            // the way without disturbing either end position.
            const y = lerp(mouth.y, item.y, t) - Math.sin(t * Math.PI) * ARC;

            // Each item opens up to the pointer as soon as it personally arrives,
            // so the ones that land early are live while the stragglers finish.
            const landed = t >= LANDED_AT;
            const isHovered = landed && hovered === i;
            // An explicit `side` wins; otherwise items on the right half hang
            // their caption to the left so it cannot run off the edge.
            const caption = CAPTION_SIDES[item.side ?? (item.x > 55 ? 'left' : 'right')];
            // Only labels that ask for it are allowed to run to a second line.
            const breaks = Boolean(item.labelWidth) || item.label.includes('\n');

            return (
              <div
                key={item.src}
                className="absolute"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${item.size}%`,
                  transform: `translate(-50%, -50%) rotate(${lerp(-25, item.rot, t) + (isHovered ? HOVER_ROT : 0)}deg) scale(${lerp(0.12, 1, t) * (isHovered ? HOVER_SCALE : 1)})`,
                  // Fades in over the first slice of its own journey so nothing
                  // is visible stacked inside the bag before it launches.
                  opacity: clamp01(t * 5),
                  // Only eased once this item has arrived — a transition while it
                  // is still being scrubbed would lag behind the scroll.
                  transition: landed ? 'transform 240ms cubic-bezier(.34,1.4,.5,1)' : 'none',
                  pointerEvents: landed ? 'auto' : 'none',
                  zIndex: isHovered ? 15 : 10,
                }}
              >
                <Image
                  src={item.src}
                  alt=""
                  width={item.w}
                  height={item.h}
                  sizes={`${item.size}vw`}
                  className="h-auto w-full"
                />

                {/* w-max is load-bearing. Positioned at left/right-full, this box
                    has no room left in its containing block, so shrink-to-fit
                    would collapse it to the longest single word and stack the
                    caption one word per line. max-content sizes it to the text
                    instead; any labelWidth then caps that and wraps within it. */}
                <div
                  className={`pointer-events-none absolute flex w-max items-center gap-1 ${caption.box}`}
                  style={{
                    // Pinned captions fade in with the item's own arrival; the
                    // rest wait for a hover.
                    opacity: item.pinned ? clamp01((t - 0.7) * 4) : isHovered ? 1 : 0,
                    transition: item.pinned ? 'none' : 'opacity 200ms ease-out',
                  }}
                >
                  {/* Only Froggie keeps its arrow on a phone. At that size the
                      others' arrows are more clutter than pointer, and dropping
                      them also closes the gap between a label and its item. */}
                  {(!isMobile || item.pinned) && (
                    <Squiggle
                      rotate={caption.arrow}
                      className={`shrink-0 text-ocean ${item.arrowClass ?? 'w-[clamp(18px,2.2vw,34px)]'}`}
                    />
                  )}
                  <span
                    className={`font-gochi ${caption.align} ${item.pinned
                      ? 'text-[clamp(0.7rem,1.25vw,1.05rem)] text-navy-dark'
                      : 'text-[clamp(0.62rem,1.1vw,0.95rem)] text-charcoal'
                      } ${breaks ? 'whitespace-pre-line' : 'whitespace-nowrap'}`}
                    // Two ways to break a line, and they compose: a labelWidth
                    // wraps the text inside that measure, while a \n in the label
                    // breaks at exactly that point. Labels with neither stay on a
                    // single line, since nowrap is what keeps short captions from
                    // folding awkwardly against a neighbouring item.
                    style={item.labelWidth ? { maxWidth: item.labelWidth } : undefined}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Drawn after the items so they read as coming out from behind it. */}
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: `${tote.x}%`,
              top: `${tote.y}%`,
              width: `${tote.size}%`,
              // Tips as the contents leave, and pivots on its base rather than
              // its middle — a bag being emptied rocks on the floor, it doesn't
              // spin in place. Rotation is applied before the centring translate.
              transformOrigin: 'bottom center',
              transform: `translate(-50%, -50%) rotate(${lerp(0, TOTE_TILT, easeOut(spill))}deg)`,
            }}
          >
            <Image
              src={tote.src}
              alt="Tote bag"
              width={tote.w}
              height={tote.h}
              sizes={`${tote.size}vw`}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
