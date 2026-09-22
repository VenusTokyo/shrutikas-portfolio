import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import TreasureSpill, { SPILL_MS } from './TreasureSpill';
import PicksView from './PicksView';
import GalleryView from './GalleryView';
import CameraView from './CameraView';
import IpodView from './IpodView';
import { FOLDERS } from '../../lib/galleries';

// lottie-web reaches for the document as it sets up, so it is kept off the server
// render entirely rather than guarded at every use.
// .then(m => m.Lottie), because lottie-react@3 exports no default. Without it
// next/dynamic hands React the module namespace object and React rejects it —
// "element type is invalid ... got: object" — which took the whole section down
// with it, since this renders inside Projects.
const Lottie = dynamic(() => import('lottie-react').then((m) => m.Lottie), { ssr: false });

// Where the chest sits inside the animation's square canvas, measured off a
// rendered frame rather than guessed: it is 27.4% of the canvas wide, and its
// middle sits 3.7% of the canvas below the canvas's middle. The animation is
// drawn with room around it for coins and rays to travel into, so anything that
// wants the chest at a given size has to frame it out of that room.
const CHEST_IN_CANVAS = { width: 0.274, offsetY: 0.037 };

// How many taps it takes. Three is the number that makes it a thing you do
// rather than a thing you click: one reads as a mis-click, two as a double-click,
// three is unmistakably deliberate.
const TAPS_NEEDED = 3;

// What the browser remembers about this reader. Finding the treasure takes
// sailing the whole route, and making someone do that again on every visit turns
// a reward into a chore — so the unlock is kept, along with whether the opening
// has been watched and whether the note has been waved away.
//
// Every access is wrapped: storage throws outright in some privacy modes, and an
// easter egg is not worth breaking a page over. If it cannot be read, the egg
// simply forgets.
const STORE_KEY = 'shrutika-treasure';

const readStore = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
};

const writeStore = (patch) => {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch }));
  } catch {
    /* nothing to do — this visit just will not be remembered */
  }
};
const PROMPTS = ['tap it three times', 'twice more', 'once more'];

// The opening, as vector rather than as frames. The GIF this replaces was 11.6MB
// for 61 baked frames at a fixed size; this is 385KB, scales to any size without
// softening, and — the part that matters here — can be played to an exact frame
// and asked when it got there.
//
// Served rather than imported, so its 385KB is fetched only by someone who opens
// the chest instead of riding in the page bundle for everyone who never finds it.
const CHEST_ANIMATION = '/treasure-chest.json';

// Where to hand over, in frames of the animation's own 60fps timeline.
//
// The chest's own movement runs to frame 69: the lid is open by 56 and the coins
// have burst by 66. Everything past that is a sparkle flourish that goes on to
// frame 278. Sitting through it to 130 meant the chest hung there open for the
// better part of a second before anything happened — so this leaves at 72, which
// is the first frame at which the chest has finished doing anything.
//
// It is a frame and not a duration on purpose: the animation reports when it gets
// here, so on a slow device the chest sinks when it has actually finished opening
// rather than when a clock said it should have.
const HANDOVER_FRAME = 72;

const SINK_MS = 640;

// How much bigger than the stage to draw the animation's canvas, as a custom
// property because the two stages are nothing like each other.
//
// The file is a 1300x1300 square with the chest sitting in the middle of it,
// about 27.4% of the width — fitted to the stage it came out a thumbnail, so the
// canvas is oversized and the stage crops it. The multiplier is against the
// stage's *height*, which is 580 on a desktop and 743 on a phone: one number
// cannot serve both, and 2.2 on the phone gave a 1635px canvas that burst out of
// a 374px-wide window.
//
// 1.3 on a phone puts the chest at about 265px across, which is two thirds of
// that window. The trade either way is the burst — coins and rays travel outward
// from the middle, and the more the canvas is magnified the more of them are cut
// off at the edges.
const CHEST_ZOOM_VAR = 'var(--chest-zoom)';

// 'locked' while the chest is shut and waiting to be tapped, 'opening' while the
// lid is going up, 'spilling' while the chest sinks and the items are in the air,
// 'settled' once everything has landed. Reopening a window that has already been
// through the whole thing starts at 'settled' — the ceremony is a surprise the
// first time and a toll booth every time after.
const PHASES = {
  LOCKED: 'locked',
  OPENING: 'opening',
  SPILLING: 'spilling',
  SETTLED: 'settled',
};

/**
 * The reward for having been round every project, and the window it opens.
 *
 * Appears only once `unlocked` goes true, hops until it has been opened at least
 * once, and settles afterwards — it stays put rather than vanishing, so the
 * window can be reopened without sailing the whole route again.
 */
export default function TreasureChest({ unlocked, reduced, style }) {
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState(false);
  const [phase, setPhase] = useState(PHASES.LOCKED);
  const [taps, setTaps] = useState(0);
  // Unlocked on a previous visit, and whether the note has been dismissed.
  const [remembered, setRemembered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Either sailed for just now, or sailed for on an earlier visit. Declared here
  // rather than beside the early return below, because an effect names it in its
  // dependency array and that array is read during the render pass — from down
  // there it would be in the temporal dead zone and throw on first paint.
  const available = unlocked || remembered;
  const [animation, setAnimation] = useState(null);
  const [focused, setFocused] = useState(null);
  const timers = useRef([]);
  // Whether the lid has been watched through once already.
  const seenOpening = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  // Both halves of this are rendered into the body rather than into the section
  // they belong to. The section clips its overflow and sits inside a wrapper with
  // a transform on it, and a transform makes its element the containing block for
  // anything positioned `fixed` underneath — so a fixed pill in there would be
  // pinned to the section, not the viewport, and clipped besides. A portal is the
  // way out of both at once.
  //
  // Deferred to an effect because there is no document to portal into while this
  // is being rendered on the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = readStore();
    if (saved.found) setRemembered(true);
    if (saved.dismissed) setDismissed(true);
    // A ref, not state: nothing renders from it, and setting it here avoids a
    // second pass just to say the ceremony has already been seen.
    if (saved.opened) seenOpening.current = true;
  }, []);

  useEffect(() => {
    if (unlocked) writeStore({ found: true });
  }, [unlocked]);

  // Fetched the moment the treasure unlocks, which is well before the window is
  // opened — the shut chest is drawn from this same file, so waiting until the
  // window opened would mean opening onto an empty stage.
  useEffect(() => {
    if (!available || animation) return undefined;
    let alive = true;
    fetch(CHEST_ANIMATION)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no animation'))))
      .then((data) => alive && setAnimation(data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [available, animation]);

  // Nothing behind the window should move while it is open. Restoring what was
  // there rather than clearing it, so this cannot quietly become the thing that
  // decides the page's overflow.
  useEffect(() => {
    if (!open) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    // Hiding the scrollbar widens the viewport, and everything on the page shifts
    // to fill it. Holding its width back as padding keeps the page still.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // Escape backs out one step at a time rather than dumping you out of the
      // whole thing from wherever you happen to be.
      if (focused !== null) setFocused(null);
      else setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, focused]);

  if (!available || !mounted) return null;

  const openChest = () => {
    setFound(true);
    setFocused(null);
    clearTimers();
    setTaps(0);
    setPhase(seenOpening.current || reduced ? PHASES.SETTLED : PHASES.LOCKED);
    setOpen(true);
  };

  const dismiss = () => {
    setDismissed(true);
    writeStore({ dismissed: true });
  };

  const closeChest = () => {
    clearTimers();
    setOpen(false);
  };

  // Cued off the image's own load rather than off mounting. Three megabytes do
  // not arrive instantly, and a GIF starts animating when it has finished
  // decoding — timing the spill from mount would have it tipping out while the
  // lid was still shut on a slow connection.
  // The animation tells us it has reached the handover frame; no clock involved.
  // From here a single timer covers the spill, which is CSS and does run to one.
  const onChestOpened = () => {
    if (phase !== PHASES.OPENING) return;
    clearTimers();
    setPhase(PHASES.SPILLING);
    timers.current = [
      setTimeout(() => setPhase(PHASES.SETTLED), SPILL_MS),
      setTimeout(() => {
        seenOpening.current = true;
        writeStore({ opened: true });
      }, SPILL_MS),
    ];
  };

  const tapChest = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= TAPS_NEEDED) setPhase(PHASES.OPENING);
  };

  const locked = phase === PHASES.LOCKED;
  // The third tap can land before 385KB has arrived. The chest stays on screen
  // through that gap rather than the stage going blank — it is simply no longer
  // asking to be tapped.
  const waitingOnFile = phase === PHASES.OPENING && !animation;
  const chestShowing = phase === PHASES.OPENING || phase === PHASES.SPILLING;
  const sinking = phase === PHASES.SPILLING;

  return createPortal(
    <>
      {/* Three nested elements, because the arrival and the hop both drive
          `transform` and would fight over it. The outer is placed and does the
          entrance once; the middle hops for as long as it needs to;
          transform-origin at the foot is what gives the squash something to push
          against — centred, it would look like breathing rather than jumping. */}
      <div
        className="pointer-events-none fixed z-[45] flex justify-center md:justify-end"
        style={{
          ...style,
          animation: reduced ? 'none' : 'treasure-pill-in 760ms cubic-bezier(.3,1.3,.5,1) both',
        }}
      >
        <div
          style={{
            transformOrigin: 'bottom center',
            animation:
              reduced || found || dismissed
                ? 'none'
                : 'treasure-jump 2.2s cubic-bezier(.3,.7,.4,1) 760ms infinite',
          }}
        >
          {/* Dismissed, it becomes the chest on its own rather than disappearing.
              The note is the announcement and can be waved away; the chest is the
              only way in, and a stray tap should not cost someone the thing they
              sailed the whole route for. */}
          {dismissed ? (
            <button
              type="button"
              onClick={openChest}
              aria-label="Open the treasure"
              className="pointer-events-auto flex items-center justify-center rounded-full border-2 border-ocean/40 bg-white p-[0.3em] shadow-[0_6px_18px_rgba(39,66,112,0.28)] transition-transform hover:scale-105 active:scale-95"
            >
          <span className="relative block w-[2.1rem] md:w-[2.6rem] shrink-0 overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
            {animation && (
              <span
                className="absolute left-1/2 top-1/2 block"
                style={{
                  width: `${100 / CHEST_IN_CANVAS.width}%`,
                  aspectRatio: '1 / 1',
                  transform: `translate(-50%, calc(-50% - ${CHEST_IN_CANVAS.offsetY * 100}%))`,
                }}
              >
                <Lottie
                  src={animation}
                  loop={false}
                  autoplay={false}
                  className="h-full w-full"
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
              </span>
            )}
          </span>
            </button>
          ) : (
            <div className="pointer-events-auto flex items-center gap-[0.35em] rounded-full border-2 border-ocean/40 bg-white py-[0.3em] pl-[0.35em] pr-[0.5em] shadow-[0_8px_22px_rgba(39,66,112,0.3)]">
              <button
                type="button"
                onClick={openChest}
                aria-label="Open the treasure"
                className="flex items-center gap-[0.5em] rounded-full transition-transform hover:scale-[1.03] active:scale-95"
              >
          <span className="relative block w-[2.1rem] md:w-[2.8rem] shrink-0 overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
            {animation && (
              <span
                className="absolute left-1/2 top-1/2 block"
                style={{
                  width: `${100 / CHEST_IN_CANVAS.width}%`,
                  aspectRatio: '1 / 1',
                  transform: `translate(-50%, calc(-50% - ${CHEST_IN_CANVAS.offsetY * 100}%))`,
                }}
              >
                <Lottie
                  src={animation}
                  loop={false}
                  autoplay={false}
                  className="h-full w-full"
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
              </span>
            )}
          </span>
                <span className="flex flex-col items-start text-left leading-tight">
                  <span className="font-gochi text-[0.82rem] leading-tight text-navy-dark md:text-lg">
                    You found a Treasure chest
                  </span>
                  <span className="font-gochi text-[0.62rem] leading-tight text-charcoal md:text-sm">
                    Sailing through the ocean
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Hide this note"
                className="flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-full font-gochi text-base leading-none text-charcoal transition-colors hover:bg-navy-dark/10"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-[5vw]"
          style={{
            animation: reduced ? 'none' : 'treasure-backdrop-in 240ms ease-out both',
          }}
        >
          {/* Dismiss by clicking away. A sibling rather than a parent of the
              panel, so a click that lands on the panel never reaches it. */}
          <button
            type="button"
            aria-label="Close the treasure"
            onClick={closeChest}
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: 'rgba(39, 66, 112, 0.45)' }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Treasure"
            className="relative h-[88svh] w-[96vw] overflow-hidden rounded-[0.6rem] border border-navy-dark/15 bg-white shadow-[0_22px_55px_rgba(39,66,112,0.4)] md:h-auto md:max-h-[88vh] md:w-[min(94vw,58rem)]"
            style={{
              animation: reduced
                ? 'none'
                : 'treasure-window-in 420ms cubic-bezier(.25,1.2,.4,1) both',
            }}
          >
            <button
              type="button"
              onClick={closeChest}
              aria-label="Close"
              className="absolute right-[2%] top-[2%] z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 font-gochi text-xl leading-none text-charcoal shadow-[0_2px_6px_rgba(39,66,112,0.2)] transition-colors hover:bg-white"
            >
              ×
            </button>

            {/* The stage, flush to the dialog on every side — the items are meant to
                run off the edges rather than sit in a white mount.

                Its shape is the one thing that differs by screen. A 16:10 box is
                right on a desktop and wrong on a phone, where it made the whole
                window 367x229 inside an 844px screen — a postage stamp. The phone
                gives the stage the window's own height instead, which makes it
                portrait, and the heap below is laid out twice because of it.

                A stage of its own shape rather than one the contents size: the
                chest leaves once the spill is over, and a box that took its
                height from whatever was inside would collapse under the items the
                moment it went — taking the scatter, which is laid out in
                percentages of this box, with it. */}
            <div className="relative h-full w-full overflow-hidden [--chest-zoom:1.3] md:aspect-[16/10] md:h-auto md:[--chest-zoom:2.2]">
              {/* Shut, and waiting to be worked at. The chest does not simply
                  open when the window does: three taps is the difference between
                  being shown a reward and prising one out, and it costs the
                  reader two seconds they spend looking at it. */}
              {(locked || waitingOnFile) && animation && (
                <div
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ height: `calc(${CHEST_ZOOM_VAR} * 100%)`, aspectRatio: '1 / 1' }}
                >
                  {/* Two nested elements, because the waiting and the knock both
                      drive `transform` and one would overwrite the other. The
                      button breathes for as long as it has to; the span inside it
                      takes the hit, remounted on every tap by its key so the
                      animation restarts rather than being ignored as unchanged. */}
                  <button
                    type="button"
                    onClick={tapChest}
                    disabled={!locked}
                    aria-label={`Tap the chest to open it — ${TAPS_NEEDED - taps} to go`}
                    className="block h-full w-full rounded-[1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/60"
                    style={{
                      animation: reduced ? 'none' : 'treasure-chest-wait 2.6s ease-in-out infinite',
                    }}
                  >
                    <span
                      key={taps}
                      className="block h-full w-full"
                      style={{
                        transformOrigin: 'bottom center',
                        animation:
                          reduced || taps === 0
                            ? 'none'
                            : 'treasure-chest-knock 360ms cubic-bezier(.3,.85,.4,1) both',
                      }}
                    >
                      {/* Held at frame 0. Same file and same box as the opening,
                          so there is nothing to swap when it starts moving. */}
                      <Lottie
                        src={animation}
                        loop={false}
                        autoplay={false}
                        className="h-full w-full"
                        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                      />
                    </span>
                  </button>

                </div>
              )}

              {/* Outside the chest's box, because that box is now taller than the
                  stage and anything pinned to its bottom edge would be off-screen. */}
              {locked && (
                <p className="pointer-events-none absolute inset-x-0 bottom-[4%] z-20 text-center font-gochi text-lg leading-none text-navy-dark md:text-2xl">
                  {PROMPTS[taps]}
                </p>
              )}

              {/* The opening. initialSegment stops it at the handover frame rather
                  than letting it run the flourish out, and onComplete is what
                  moves the whole sequence on — the animation says when it is
                  done instead of a timer guessing.

                  It sinks rather than fades. The chest is heavy and full of the
                  things that are about to be in the air, and dropping out of
                  frame says that where dissolving does not — and it leaves by the
                  bottom while they arrive from the top, so the two never contend
                  for the same space.

                  Nothing renders until the file is in hand; if the third tap beats
                  the fetch, the closed chest simply stays up a moment longer. */}
              {chestShowing && animation && (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
                  style={{ height: `calc(${CHEST_ZOOM_VAR} * 100%)`, aspectRatio: '1 / 1' }}
                >
                  {/* The sink is on its own element: the box outside holds the
                      translate that centres it, and a keyframe setting
                      `transform` would throw that away — the same trap the
                      falling items were in. */}
                  <div
                    className="h-full w-full"
                    style={{
                      animation:
                        sinking && !reduced
                          ? `treasure-chest-sink ${SINK_MS}ms cubic-bezier(.45,0,.85,.5) both`
                          : 'none',
                    }}
                  >
                  <Lottie
                    src={animation}
                    loop={false}
                    autoplay
                    segment={[0, HANDOVER_FRAME]}
                    subscriptions={{ complete: onChestOpened }}
                    className="h-full w-full"
                      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                    />
                  </div>
                </div>
              )}

              {/* Nothing to tip out until the chest is on its way down. */}
              {(phase === PHASES.SPILLING || phase === PHASES.SETTLED) && (
                <TreasureSpill
                  settled={phase === PHASES.SETTLED}
                  focused={focused}
                  onFocus={setFocused}
                  onBack={() => setFocused(null)}
                  reduced={reduced}
                />
              )}

              {/* Each item's own view, over the stage once that item has been
                  picked up. Held back a moment by its own animation delay so the
                  thing you clicked is seen to arrive in the middle before its
                  contents open over it. */}
              {focused === 'ipod' && (
                <IpodView reduced={reduced} onBack={() => setFocused(null)} />
              )}

              {focused === 'digicam' && (
                <CameraView reduced={reduced} onBack={() => setFocused(null)} />
              )}

              {focused === 'cdrom' && (
                <PicksView reduced={reduced} onBack={() => setFocused(null)} />
              )}

              {focused === 'crochet' && (
                <GalleryView
                  kind="crochet"
                  title="Made by hand"
                  subtitle="hooks, hoops and yarn"
                  folderUrl={`https://drive.google.com/drive/folders/${FOLDERS.crochet}`}
                  reduced={reduced}
                  onBack={() => setFocused(null)}
                />
              )}

              {focused === 'palette' && (
                <GalleryView
                  kind="paint"
                  title="Painted"
                  subtitle="watercolour, acrylic and ink"
                  folderUrl={`https://drive.google.com/drive/folders/${FOLDERS.paint}`}
                  reduced={reduced}
                  onBack={() => setFocused(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    // Into the app's own wrapper rather than the body, which sits outside the
    // element next/font puts --font-gochi on — portalling to the body quietly
    // drops the handwriting everywhere in here. The wrapper carries no transform,
    // so `fixed` still resolves against the viewport from inside it.
    document.getElementById('scrapbook-root') || document.body
  );
}
