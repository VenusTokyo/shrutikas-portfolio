import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Section from './Section';
import ProjectPage from './ProjectPage';
import TreasureChest from './TreasureChest';
import Squiggle, { POINTS_LEFT, POINTS_RIGHT } from '../../components/ui/Squiggle';
import { useIsMobile } from '../../hooks/useIsMobile';

// Newest first, which is also the order the wheel walks through them. Details are
// drawn from each repo's own README rather than written from the outside, so the
// wording matches what the projects say about themselves.
//
// Kept to a line and two points apiece on purpose. The sheet is a card in a
// carousel, not documentation — anyone who wants the full account has the repo a
// click away, and the longer version crowded the artwork it sits next to.
const PROJECTS = [
  {
    name: 'Midpoint',
    tagline: 'meet halfway',
    image: '/MidPointImg.png',
    imageW: 1561,
    imageH: 826,
    blurb:
      'Finds a fair meeting point between two people, then suggests real places to go near it.',
    points: [
      'Nudges the midpoint toward a real cluster of venues, so halfway is somewhere worth going',
      'Real driving times from both ends — and no sign-up, the whole plan lives in the link',
    ],
    stack: ['React', 'Vite', 'Leaflet', 'OSRM'],
    links: [
      { label: 'Live', href: 'https://midpoint-puce.vercel.app' },
      { label: 'Code', href: 'https://github.com/VenusTokyo/Midpoint' },
    ],
  },
  {
    name: 'TaskFlow',
    tagline: 'projects, tracked',
    image: '/TaskFlowImg.png',
    imageW: 1918,
    imageH: 907,
    blurb:
      'A full-stack project and task manager, built around a drag-and-drop Kanban board.',
    points: [
      'Board built on dnd-kit, with JWT auth and hashed passwords behind it',
      'Raw SQL against SQLite — no ORM in the way',
    ],
    stack: ['React 19', 'Express 5', 'SQLite', 'JWT'],
    links: [
      {
        label: 'Demo',
        href: 'https://drive.google.com/file/d/1hYoBILpga5v44yMzQUWf6eaXnDhVcVDE/view?usp=sharing',
      },
      { label: 'Code', href: 'https://github.com/VenusTokyo/TaskFlow' },
    ],
  },
  {
    name: 'Pockets',
    tagline: 'one wallet, many pockets',
    image: '/PocketsDemoImg.png',
    imageW: 1899,
    imageH: 911,
    blurb:
      'A Web3 wallet on Stacks that splits one wallet into virtual sub-wallets — budgeting on chain.',
    points: [
      'Named pockets for savings, bills or goals, each with its own balance',
      'Deposit, move and spend STX, every movement through a Clarity contract',
    ],
    stack: ['Next.js', 'TypeScript', 'Clarity', 'Stacks'],
    links: [{ label: 'Code', href: 'https://github.com/VenusTokyo/pockets-frontend' }],
  },
  {
    name: 'Expeasy',
    tagline: 'expense tracking made easy',
    image: '/ExpeasyImg.png',
    imageW: 1899,
    imageH: 914,
    blurb:
      'Log income and expenses, sort them into categories of your own, and watch the dashboards build themselves.',
    points: [
      'Custom categories, on a yearly, monthly or self-chosen timeline',
      'Interactive charts over the full history, the lot exportable to CSV',
    ],
    stack: ['Next.js', 'Prisma', 'Clerk', 'Recharts'],
    links: [
      { label: 'Live', href: 'https://expeasy-venustokyo.vercel.app/' },
      { label: 'Code', href: 'https://github.com/VenusTokyo/Expeasy' },
    ],
  },
];

const WHEEL = { src: '/steeringWheel.png', w: 1000, h: 1000 };
// Capital P is the actual filename on disk. Windows lets the lowercase spelling
// pass locally; the host won't.
const TITLE = { src: '/Projects.png', w: 1205, h: 265 };

// The flat body of water — the solid rectangle the crests are drawn on top of.
// Deliberately a shallow strip: the waves above it are what should read as the
// sea, and every pixel of flat blue down here is a pixel of the section the
// projects don't get.
//
// A plain height rather than a share of the wheel, which is what it used to be.
// Tying the two meant a bigger wheel dragged the water up with it, and how much
// solid blue sits at the foot of the section is a question about the section,
// not about the artwork standing in it.
const SEA_H = '14vh';
// How far the wheel's bottom edge sits above the section's floor — so it stands
// in the water rather than on the floor beneath it. What sinks the wheel is
// mostly the passes that wash in front of it, not this strip.
const LIFT = '-15vh';

// How far the wheel runs past the right edge of the screen, as a share of its
// own width. Around this much puts the hub near the screen's edge, leaving the
// wheel's left side — spokes radiating in from off-stage. The helm reads as far
// bigger than the frame it sits in, and the space it gives back on the left is
// where the projects themselves will go.
const BLEED = 0.4;

// The wheel's diameter lives in --wheel (set on the Section below) rather than
// as a class, because the sea's depth and the buttons' placement are both
// derived from it — the whole arrangement has to move together when it changes.
const WHEEL_W = 'var(--wheel)';
// The wheel's left edge, measured from the right edge of the screen. Everything
// placed beside the wheel hangs off this, so the bleed only has to be right once.
const WHEEL_LEFT = `calc(${WHEEL_W} * ${1 - BLEED})`;
// The controls ride on the water rather than beside the rim, so they are placed
// against the sea's depth instead of the wheel's height. Halfway down the band
// keeps them clear of the crests breaking above and the scalloped underside.
const BUTTON_Y = `calc(${SEA_H} / 2)`;
// Clearance between the controls and the rim.
const BUTTON_GAP = 'clamp(0.5rem, 2vw, 2.5rem)';
// Where the controls sit horizontally, measured from the right of the screen.
//
// On a wide screen they tuck against the wheel's left edge. A phone hasn't the
// width for that: the wordmark takes the left of the water and the controls
// landed straight on top of it — and both being butter, they disappeared into
// the lettering rather than merely crowding it. There they go to the far end of
// the water instead, over the wheel's own submerged foot, which is no worse a
// place for the thing that turns it.
//
// A JS branch rather than a breakpoint because the wide value is derived from
// BLEED. Tailwind only emits classes it can read literally in the source, so an
// arbitrary value built from a constant would never be generated — and spelling
// the number out again here is exactly the duplication that goes stale.
const CONTROLS_RIGHT_WIDE = `calc(${WHEEL_LEFT} + ${BUTTON_GAP})`;
const CONTROLS_RIGHT_PHONE = '5vw';
// Capped against the water's depth as well as the viewport. The doodle is square,
// so its width is also its height — on a strip this shallow, a button sized only
// by the screen would hang out of the water at both ends, and the bottom of it
// would be cropped off with the section's floor.
const BUTTON_W = `min(clamp(3.25rem, 8vw, 7rem), calc(${SEA_H} * 0.8))`;
// The wordmark rides the water on the same reasoning as the controls, and for a
// harder reason: the artwork is butter, which is the page's own background — the
// moment it clears the waterline it is invisible ink on the paper behind it.
const TITLE_Y = `calc(${SEA_H} / 2)`;

// Recolours the doodles to the page's butter, so they read against the water
// they now sit on. Same technique the footer uses on its wordmarks: brightness(0)
// flattens the artwork to black first, which is what lets the chain after it
// land on one predictable hue whatever colour the source happened to be.
const BUTTER_FILTER =
  'brightness(0) saturate(100%) invert(96%) sepia(10%) saturate(562%) hue-rotate(344deg) brightness(97%) contrast(91%)';

/**
 * A smooth wave across the 1440-unit box, `periods` full waves wide. Half a
 * period per cubic, alternating which side the control points sit on.
 *
 * Every pass is a squiggle with a solid slab under it, and `crest`/`trough` are
 * where one ends and the other begins — both measured down from the top of the
 * pass, out of 100:
 *
 *   crest   how high the peaks reach. 0 is the very top of the pass.
 *   trough  how low the dips fall. The slab under the dips is what's left
 *           below it, so solid = 100 - trough.
 *
 * At the defaults the curve swings 10..90 and leaves a tenth of the pass solid.
 * Dropping `trough` to 50 gives a squiggle over a half-solid slab; the swing
 * shrinks to match unless the pass gets taller, since the two share the height
 * between them.
 *
 * The control points are pushed past the extreme they aim for, because a cubic
 * only travels a quarter of the way toward them at its midpoint — parked exactly
 * on the target they'd give a limp wave reaching a quarter of the intended
 * swing. (4E - mid)/3 is the overshoot that lands the curve on E. Every join
 * keeps the same rise and run either side of it, which stops the curve kinking
 * at segment boundaries.
 *
 * Generated rather than written out because at high frequencies this is dozens
 * of segments to type by hand.
 *
 * `periods` may be any multiple of 0.5; each segment ends back on the midline,
 * so a half period still closes cleanly. `inverted` starts on a trough instead
 * of a crest, which is how two passes of the same frequency are kept apart.
 */
const wavePath = (periods, { inverted = false, crest = 10, trough = 90 } = {}) => {
  const mid = (crest + trough) / 2;
  const control = (extreme) => Math.round(((4 * extreme - mid) / 3) * 10) / 10;
  const half = 1440 / (periods * 2);
  let d = `M0,${mid}`;
  for (let i = 0; i < periods * 2; i++) {
    const x = i * half;
    const y = (i % 2 === 0) !== inverted ? control(crest) : control(trough);
    d += ` C${x + half * 0.25},${y} ${x + half * 0.75},${y} ${x + half},${mid}`;
  }
  return `${d} L1440,100 L0,100 Z`;
};

// Three passes at the same waterline, drawn back to front. Each is a filled
// shape whose flat bottom (y=100) is the join with the water below, so they all
// hang from the same anchor and differ only in how high their crests reach.
//
// The heights are deliberately spread rather than evenly stepped — near enough
// to double between neighbours. Passes within a stone's throw of each other read
// as one thick edge that happens to be drawn three times; it takes a gap about
// this wide before the eye sorts them into distance.
//
// All three keep a long wavelength, within half a period of each other. The
// shape of the swell is meant to be the same water throughout — what separates
// the passes is how far each one rises, not how tightly it ripples. Packing more
// waves into a shorter pass to compensate for its height just turns it into a
// different substance.
const WAVES = [
  {
    d: wavePath(2),
    height: '18vh',
    opacity: 0.3,
    drift: 'left',
    seconds: 7,
  },
  {
    d: wavePath(3, { inverted: true }),
    height: '10vh',
    opacity: 0.55,
    drift: 'right',
    seconds: 5,
  },
  // The water's real edge, and still a proper swell — it rises less than the two
  // behind it, but it breaks on the same scale.
  {
    d: wavePath(2.5),
    height: '5vh',
    opacity: 1,
    drift: 'left',
    seconds: 4,
  },
];

// The helm stands between the two backmost passes: only the roller breaks behind
// it, and the other two wash across its foot.
const WAVES_BEHIND = WAVES.slice(0, 1);
const WAVES_FRONT = WAVES.slice(1);

// The scalloped underside of the band, hanging into the gap below the section.
// Its own pass rather than a reference to the front one, so retuning the water's
// edge doesn't silently reshape the cut edge underneath it — they answer to
// different things.
const CREST = wavePath(2.5);

// Each layer is drawn wider than the band and hung off its left, so drifting
// sideways never walks an edge into view.
const WAVE_OVERHANG = { left: '-15%', width: '130%' };

// The page rides above the waterline, clear of the controls and the wordmark so
// you can keep turning the wheel with a project already open. Not so far clear
// that it floats free of the sea, though: the sheet sits behind the passes that
// break in front of the wheel, and this leaves it low enough for their crests to
// wash over its bottom edge.
//
// Only its bottom is pinned; the height is the sheet's own (see ProjectPage),
// because pinning both ends stretched it to the full section and left a third of
// the paper blank under the content.
const PAGE_BOTTOM = `calc(${SEA_H} + 6vh)`;

// The sheet stops short of the helm rather than running the width of the screen —
// the wheel is the thing you are turning, and burying it while you turn it reads
// as the page having nothing to do with it. Measured off the wheel's own left
// edge, so it keeps clearing the rim at any bleed or wheel size.
const PAGE_RIGHT = `calc(${WHEEL_LEFT} + 2vw)`;
// A phone hasn't the width to spare: the sheet takes the screen there and the
// wheel goes behind it.
const PAGE_INSET_PHONE = { left: '4vw', right: '4vw', bottom: PAGE_BOTTOM };
const PAGE_INSET_WIDE = { left: '5vw', right: PAGE_RIGHT, bottom: PAGE_BOTTOM };

// The invitation shown while nothing is open takes the same box as the sheet it
// is inviting you to open, with a top as well so it can centre itself in the
// blank rather than sit on the floor of it.
const HINT_TOP = '16vh';
// On a phone the hint sits in the band above the wheel rather than centred in
// the section. The wheel now reaches up to about a quarter of the way down the
// screen, and text centred in what used to be empty space landed squarely on the
// wood, where dark blue on dark walnut cannot be read at all. No `bottom`, so
// the box is only as tall as the two lines and stays clear of the rim.
const HINT_INSET_PHONE = { left: '4vw', right: '4vw', top: '7vh' };
const HINT_INSET_WIDE = { ...PAGE_INSET_WIDE, top: HINT_TOP };

// The reward pins to the corner of the section itself. Hanging it off the page's
// right edge instead looked centred on screen, because the sheet stops well short
// of the helm — the corner of the sheet is nowhere near the corner of the view.
//
// On a wide screen it goes right down into the water, where the far right is
// clear: the controls sit in the same band but far enough inboard to leave the
// corner empty. A phone has no such room — the controls are themselves pinned to
// that corner there — so it rides just above the waterline instead, directly over
// them rather than on top of them.
// Where the reward sits, measured from the corner of the window rather than from
// inside this section: it is fixed to the viewport and outlives the section, so
// the water scrolls past behind it.
//
// Top of the screen on a phone, bottom-right on a desktop. A note pinned to the
// bottom of a phone sits over the thumb and under the browser's own bar, and on
// this page it landed on the waves where it was hardest to read; arriving at the
// top is also what every other notification on the device does.
const REWARD_INSET_PHONE = { left: '4vw', right: '4vw', top: '2.5vh' };
const REWARD_INSET_WIDE = { right: '3vw', bottom: '3vh' };

// How many times each project has to be dealt before the treasure is handed
// over. One pass round the wheel was too easy to stumble into — anyone idly
// pressing an arrow reached the end of the list and the reward fell out. Two
// passes is about twenty presses, which is a deliberate act rather than an
// accident.
//
// Counted per project, not in total. A single tally cannot tell five projects
// seen twice from one project opened ten times, and rocking between two of them
// should not hand over anything.
const VISITS_NEEDED = 2;

// A halo on the controls, so the thing the invitation points at is the thing
// that catches the eye. It breathes only while no project is open: once you are
// reading a page, a pulse in the corner is just something twitching at you.
const ARROW_GLOW_IDLE = 'arrow-glow 2.4s ease-in-out infinite';
const ARROW_GLOW_RESTING = 'drop-shadow(0 0 6px rgba(238, 229, 188, 0.7))';

// The outgoing sheet has to be gone before the next one is dealt, so these run
// back to back rather than crossing. Together they land near the wheel's own
// spin, which is what makes the turn and the page read as one action.
const PAGE_OUT_MS = 340;

const QUARTER_TURN = 90;
const SPIN_MS = 780;
// Overshoots slightly and settles back — a wheel spun by hand carries past the
// stop and catches, where a plain ease-out reads as a motor driving it.
const SPIN_EASE = 'cubic-bezier(.34,1.28,.42,1)';

/**
 * One pass of water. Anchored by its own flat bottom, so whatever it is dropped
 * into decides where the waterline falls and the crest climbs from there — which
 * is what lets the passes behind the wheel and the one in front of it be the
 * same component despite living in different layers.
 */
function WaveLayer({ wave, reduced }) {
  return (
    <svg
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute bottom-0 max-w-none fill-ocean"
      style={{
        ...WAVE_OVERHANG,
        height: wave.height,
        opacity: wave.opacity,
        animation: reduced
          ? 'none'
          : `wave-drift-${wave.drift} ${wave.seconds}s ease-in-out infinite`,
      }}
    >
      <path d={wave.d} />
    </svg>
  );
}

export default function Projects() {
  // Counted in quarter turns rather than degrees, and never wrapped back to 0:
  // the running total is what lets the wheel keep spinning the same way instead
  // of unwinding when it passes full circle.
  const [turns, setTurns] = useState(0);
  const [reduced, setReduced] = useState(false);
  const isMobile = useIsMobile();

  // The sheet on screen. `index` is null until the first press — the section
  // opens as just the helm and the sea, with nothing dealt yet.
  // `entry` is the corner a sheet swings in by, both of them out on the right
  // beside the wheel. Starboard brings them up from the bottom and takes them out
  // the top; port runs the orbit the other way.
  const [page, setPage] = useState({ index: null, entry: 'bottom', phase: 'in', seq: 0 });
  // One tally per project, counted up to VISITS_NEEDED and held there — past the
  // threshold the extra presses are of no interest, and stopping the climb keeps
  // the array from changing identity on every turn once the route is complete.
  const [visits, setVisits] = useState(() => PROJECTS.map(() => 0));
  const timers = useRef([]);
  // Mirrors page.index so a second press that lands before the first has
  // re-rendered still steps on from the right project rather than repeating it.
  const shown = useRef(null);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const running = timers.current;
    return () => running.forEach(clearTimeout);
  }, []);

  // `step` walks the wheel; `entry` is the edge the sheet flies through, which is
  // why the two controls are told apart here rather than by the sign of the step.
  const turn = (step, entry) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setTurns((t) => t + step);

    // The first press opens an end of the list rather than stepping off the turn
    // count — counting from zero would have made a first press to starboard skip
    // straight past the opening project. From then on it walks from whatever is
    // showing. Modulo of a negative is negative in JS, hence the second wrap:
    // stepping to port from the first project has to land on the last.
    const current = shown.current;
    const index =
      current === null
        ? step > 0
          ? 0
          : PROJECTS.length - 1
        : (((current + step) % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
    shown.current = index;
    setVisits((v) => (v[index] >= VISITS_NEEDED ? v : v.map((n, i) => (i === index ? n + 1 : n))));

    // Nothing on screen yet: deal straight in. Otherwise the sheet already there
    // has to leave first, and only then does the next one fly.
    if (current === null) {
      setPage((p) => ({ index, entry, phase: 'in', seq: p.seq + 1 }));
      return;
    }

    // `entry` is set now rather than at the swap, because the sheet on its way
    // out leaves by the opposite corner from the one the next sheet arrives by —
    // the departure is already the new press's business.
    setPage((p) => ({ ...p, entry, phase: 'out', seq: p.seq + 1 }));
    timers.current = [
      setTimeout(
        () => setPage((p) => ({ index, entry, phase: 'in', seq: p.seq + 1 })),
        reduced ? 0 : PAGE_OUT_MS
      ),
    ];
  };

  // While a sheet is open the halo holds steady instead of breathing; an
  // animated `filter` would also override the resting one, so only ever one of
  // the two is live at a time.
  const idle = page.index === null;
  const arrowGlow = reduced || !idle ? 'none' : ARROW_GLOW_IDLE;

  const closePage = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    shown.current = null;
    setPage((p) => ({ ...p, phase: 'out', seq: p.seq + 1 }));
    timers.current = [
      setTimeout(
        () => setPage((p) => ({ ...p, index: null })),
        reduced ? 0 : PAGE_OUT_MS
      ),
    ];
  };

  return (
    <Section
      id="projects"
      // The section is one screen; the room around it is margin, so the space
      // belongs to the page's rhythm rather than to this section's layout. That
      // also keeps the wheel sized against a screen rather than against a box
      // that happens to be taller than one.
      //
      // overflow-hidden does double duty: it lets the sea run a viewport wide
      // inside a section that carries side padding, and it crops the part of the
      // wheel that hangs off the right.
      // The wheel stands as tall as the screen bar a little headroom, so the vh
      // term is the one meant to bind. The vw term is only a floor for narrow
      // windows: half the wheel is on screen, so it claims half its width there,
      // and the controls still have to fit in what is left to its left.
      className="relative my-[10svh] overflow-hidden [--wheel-bleed:0.18] [--wheel-lift:0px] [--wheel:min(85vh,160vw)] md:[--wheel-bleed:0.4] md:[--wheel-lift:-15vh] md:[--wheel:min(120vh,90vw)]"
    >
      <div className="relative h-full w-full">
        {/* A viewport-wide stage. The wheel and its controls are placed against
            its right edge rather than the section's, so the bleed is measured
            from the real screen edge and not from inside the side padding. */}
        <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2">
          {/* The one pass that breaks behind the helm. A zero-height rail parked
              on the waterline: its children hang from its bottom edge, so their
              crests climb out of the water while everything they'd draw below it
              is covered by the water itself, which sits in front of them. */}
          <div
            className="pointer-events-none absolute inset-x-0 -mb-px z-10"
            style={{ bottom: SEA_H }}
          >
            {WAVES_BEHIND.map((wave) => (
              <WaveLayer key={wave.d} wave={wave} reduced={reduced} />
            ))}
          </div>

          {/* Between the two backmost passes: only the roller breaks behind it,
              and the two nearer passes wash across its foot. Still under the
              water body itself, so the rim stays a rim and simply goes under the
              surface rather than being clipped. */}
          <div
            className="absolute bottom-0 z-20"
            style={{
              width: WHEEL_W,
              // Bleed and lift come from custom properties rather than the
              // module constants, because the phone needs its own: at desktop's
              // numbers the wheel came out 359px with 126px of it hanging below
              // the section and only 115px showing above the sea — a sliver of
              // handle in a screen of white.
              right: `calc(${WHEEL_W} * -1 * var(--wheel-bleed))`,
              marginBottom: 'var(--wheel-lift)',
            }}
          >
            <Image
              src={WHEEL.src}
              alt="Ship's wheel"
              width={WHEEL.w}
              height={WHEEL.h}
              sizes="(max-width: 767px) 160vw, 120vh"
              priority={false}
              className="h-auto w-full select-none"
              style={{
                transform: `rotate(${turns * QUARTER_TURN}deg)`,
                transition: reduced ? 'none' : `transform ${SPIN_MS}ms ${SPIN_EASE}`,
              }}
            />
          </div>

          {/* The sea lives inside the stage, not beside it. The stage carries a
              translate, and any transform makes an element a stacking context —
              so a z-index set on a sibling out here is compared against the stage
              as a whole, not against the wheel and controls within it. Kept
              outside, the water was drawn over the buttons however high their
              z-index went. In here all three sort against each other, which is
              what the numbers were always meant to say: wheel under water, water
              under controls. The stage is already a viewport wide, so inset-x-0
              reaches the screen edges without repeating the centring trick. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-ocean"
            style={{ height: SEA_H }}
          >
            {/* The passes drawn in front of the wheel, the last of them the
                water's real edge. Hung from a zero-height rail on the band's top
                edge so they anchor the same way as the roller behind. The rail is
                nudged a pixel *into* the water rather than out of it: a crest
                fills downward to its own bottom edge, so pulling it clear of the
                band opens the very hairline the nudge is there to close. */}
            <div className="absolute inset-x-0 top-0 mt-px">
              {WAVES_FRONT.map((wave) => (
                <WaveLayer key={wave.d} wave={wave} reduced={reduced} />
              ))}
            </div>

            {/* With a gap under the section the water no longer runs into
                whatever follows, so its underside is on show and a ruled edge
                there would read as the band having been cut off. The front
                crest, turned about both axes: it hangs below the band rather
                than biting into it, so the water itself stays whole and the
                wheel behind can't show through a trough. Turning it also flips
                it left to right, which stops the two edges from mirroring each
                other exactly. */}
            <svg
              viewBox="0 0 1440 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-x-0 top-full -mt-px h-[3.5vh] w-full rotate-180 fill-ocean"
            >
              <path d={CREST} />
            </svg>
          </div>

          {/* Shown in the blank the sheet will fill, and only while that blank
              exists. Inert to the pointer: the controls it names are elsewhere,
              and a full-width invisible box over the paper would otherwise be
              swallowing clicks meant for the helm behind it. */}
          {page.index === null && (
            <div
              className="pointer-events-none absolute z-[25] flex flex-col items-center justify-center gap-[0.35em] text-center"
              style={{
                ...(isMobile ? HINT_INSET_PHONE : HINT_INSET_WIDE),
                animation: reduced ? 'none' : 'helm-hint-pulse 2.4s ease-in-out infinite',
              }}
            >
              <p className="font-gochi text-2xl leading-tight tracking-wide text-navy-dark md:text-4xl">
                Take control of the ship
              </p>
              <p className="font-gochi text-base leading-tight tracking-wide text-charcoal md:text-xl">
                navigate with the arrows below
              </p>
            </div>
          )}

          {/* Dealt only once a control has been pressed — the section opens as
              just the helm and the sea. Inside the stage so its own inset is
              measured against the screen, and pointer-events-auto on the sheet
              itself, since the stage above is inert. */}
          {page.index !== null && (
            <ProjectPage
              project={PROJECTS[page.index]}
              index={page.index}
              total={PROJECTS.length}
              phase={page.phase}
              entry={page.entry}
              reduced={reduced}
              animationKey={page.seq}
              inset={isMobile ? PAGE_INSET_PHONE : PAGE_INSET_WIDE}
              onClose={closePage}
            />
          )}

          <TreasureChest
            unlocked={visits.every((n) => n >= VISITS_NEEDED)}
            reduced={reduced}
            style={isMobile ? REWARD_INSET_PHONE : REWARD_INSET_WIDE}
          />

          {/* Hard against the left edge and low in the water, drawn over every
              pass. Inside the stage rather than the section, so left-0 is the
              real screen edge and not the inside of the section's padding.
              Still an h2 — the artwork carries the section's heading now that
              the typeset one is gone, and the outline shouldn't lose a level
              just because the words became a picture. */}
          <h2
            className="pointer-events-none absolute left-0 z-40 w-[54vw] translate-y-1/2 md:w-[34vw]"
            style={{ bottom: TITLE_Y }}
          >
            <Image
              src={TITLE.src}
              alt="Projects"
              width={TITLE.w}
              height={TITLE.h}
              sizes="(max-width: 767px) 54vw, 34vw"
              className="h-auto w-full select-none"
            />
          </h2>

          {/* Both controls sit together on the water, to the left of the rim.
              With the wheel running off the right of the screen there is no
              outside edge to put the second one against, so they pair up on the
              side that still has room.

              They stay a sibling of the sea rather than a child of it: that band
              is pointer-events-none so it can't swallow clicks meant for the
              wheel, and anything nested inside would inherit the same. z-50
              carries them over the water they are drawn on, and over the page —
              they have to stay pressable with a project already open. */}
          <div
            className="absolute z-50 flex translate-y-1/2 items-center gap-[clamp(0.25rem,1vw,1.25rem)]"
            style={{
              bottom: BUTTON_Y,
              right: isMobile ? CONTROLS_RIGHT_PHONE : CONTROLS_RIGHT_WIDE,
            }}
          >
            <button
              type="button"
              onClick={() => turn(-1, 'top')}
              aria-label="Turn the wheel to port"
              className="transition-transform hover:-translate-x-1 active:scale-90"
              style={{ width: BUTTON_W, animation: arrowGlow, filter: ARROW_GLOW_RESTING }}
            >
              <span className="block" style={{ filter: BUTTER_FILTER }}>
                <Squiggle rotate={POINTS_LEFT} className="h-auto w-full" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => turn(1, 'bottom')}
              aria-label="Turn the wheel to starboard"
              className="transition-transform hover:translate-x-1 active:scale-90"
              style={{ width: BUTTON_W, animation: arrowGlow, filter: ARROW_GLOW_RESTING }}
            >
              <span className="block" style={{ filter: BUTTER_FILTER }}>
                <Squiggle rotate={POINTS_RIGHT} className="h-auto w-full" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
