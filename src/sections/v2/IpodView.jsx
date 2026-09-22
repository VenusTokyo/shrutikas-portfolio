import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useIsMobile } from '../../hooks/useIsMobile';
import { HEAP } from './TreasureSpill';

// 555x916 since the artwork was cropped. These have to match the file: declaring
// the old 1200x1200 told next/image to reserve a square box for a portrait
// picture, so it rendered letterboxed inside a box half again too tall — which is
// what put a second, ghosted iPod behind the real one.
const IPOD = { src: '/treasure/ipod.png', w: 555, h: 916 };

// Paste the Spotify share link for the playlist here — the whole URL is fine,
// the id is pulled out of it below. Left empty the panel still opens and says so
// rather than embedding something that isn't hers.
const PLAYLIST_URL = 'https://open.spotify.com/playlist/5X708Ep5F9Yv2BszNYIVpN?si=a7cc5968c56a4365';

// Measured off the cropped artwork: the screen is 443x330 at (52, 60) in the
// 555x916 canvas. The crop moved it without resizing it — it is the same 443x330
// of pixels it always was, just no longer surrounded by empty margin.
const SCREEN = {
  left: `${(52 / 555) * 100}%`,
  top: `${(60 / 916) * 100}%`,
  width: `${(443 / 555) * 100}%`,
  height: `${(330 / 916) * 100}%`,
};

// Deliberately taller than the panel, and anchored to its top. Fitting the whole
// iPod in meant the height of the panel had to hold all 916 rows of artwork, and
// the screen is only 330 of them — so the one part anyone opened this for came
// out barely 250px wide. Oversizing it and letting the body run off the bottom
// edge trades away the click wheel, which does nothing, for a screen close to
// twice the size.
//
// Sized against the panel's height rather than its width so it holds at any
// window size. The screen's far edge sits at 0.703 of the artwork's width, which
// is 0.83 of the panel's height at this figure: the screen clears with a little
// of the body still showing beneath it, and nothing is ever cut off the top.
const IPOD_FILL = 195;

// Spotify lays its embed out for a real viewport, so the iframe is always built
// at a size it is happy with and scaled down to whatever the screen actually is:
// the layout stays correct and only the pixels get smaller.
//
// The height is chosen first, and this is the part that matters. Spotify picks a
// layout from the height it is given rather than filling the height it has —
// under about 200px it renders the compact player and leaves the rest of the
// iframe transparent, which is what was showing the screen's black backing as a
// band under the tracks. 352 is one of the heights it lays the full list out in.
// The width then follows from the screen's own 443:330 so the embed matches the
// hole it sits in; deriving the height from a chosen width, as this did before,
// lands on in-between numbers Spotify has no layout for.
const NATIVE_H = 500;
const NATIVE_W = Math.round((NATIVE_H * 443) / 330);

const playlistId = (input) => {
  if (!input) return '';
  const fromUrl = input.match(/playlist[/:]([A-Za-z0-9]+)/);
  if (fromUrl) return fromUrl[1];
  return /^[A-Za-z0-9]+$/.test(input.trim()) ? input.trim() : '';
};

const embedSrc = (id) => `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;

/**
 * The playlist, playing in the iPod's screen.
 *
 * On a phone the iPod is dropped and the embed stands on its own: the same sum
 * that gives a 285px screen on a desktop gives 101px there, and a player scaled
 * to a quarter is a picture of a player, not one you could use.
 */
export default function IpodView({ reduced, onBack }) {
  const id = playlistId(PLAYLIST_URL);
  const isMobile = useIsMobile();
  const screenRef = useRef(null);
  const [scale, setScale] = useState(0);
  const panelRef = useRef(null);
  const zoomRef = useRef(null);
  const [from, setFrom] = useState(null);

  // Where this iPod has to start so that it begins life exactly on top of the one
  // in the heap: same place, same size, same tilt. Measured rather than worked out
  // from the percentages, because the offset between the two depends on the header
  // above this, which is sized in text and does not scale with the stage.
  //
  // useLayoutEffect, not useEffect: this has to be settled before the browser
  // paints, or the iPod is seen for one frame at full size before it jumps back
  // to the heap's to start the zoom.
  useLayoutEffect(() => {
    if (reduced || isMobile) return;
    const box = zoomRef.current;
    const panel = panelRef.current;
    if (!box || !panel || !panel.parentElement) return;
    const stage = panel.parentElement.getBoundingClientRect();
    const here = box.getBoundingClientRect();
    if (!stage.width || !here.width) return;
    const heap = HEAP.ipod;
    setFrom({
      scale: ((heap.size / 100) * stage.width) / here.width,
      dx: stage.left + (heap.x / 100) * stage.width - (here.left + here.width / 2),
      dy: stage.top + (heap.y / 100) * stage.height - (here.top + here.height / 2),
      rotate: heap.rest,
    });
  }, [reduced, isMobile]);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return undefined;
    // Measured rather than computed from a breakpoint: the screen's size depends
    // on the stage, which depends on the window, and the scale has to follow it.
    const measure = () => setScale(el.clientWidth / NATIVE_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile, id]);

  const player = (
    <iframe
      title="Playlist"
      src={embedSrc(id)}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      // Fills the box it is scaled inside; without a size an iframe falls back
      // to its 300x150 default and the scale lands on the wrong thing.
      style={{ border: 0, width: "100%", height: "100%" }}
    />
  );

  return (
    <div
      ref={panelRef}
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-white"
      style={{
        // Short and immediate. The panel is only the backdrop now; the iPod
        // inside it carries the transition, and a slow fade over the top of that
        // just makes the object look like it is arriving twice.
        animation: reduced ? 'none' : 'treasure-panel-in 260ms ease-out both',
      }}
    >
      <header className="relative z-20 flex shrink-0 items-baseline justify-between gap-3 px-[4%] pb-[1.5%] pt-[3%]">
        <div className="flex min-w-0 items-baseline gap-2">
          <h4 className="font-gochi text-xl leading-none text-navy-dark md:text-3xl">On loop</h4>
          <span className="truncate font-gochi text-xs leading-none text-charcoal md:text-base">
            what she builds to
          </span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-full border border-ocean/30 px-[0.9em] py-[0.2em] font-gochi text-xs leading-snug text-navy-dark transition-colors hover:bg-ocean/10 md:text-sm"
        >
          back
        </button>
      </header>

      {!id && (
        <p className="m-auto rounded-[0.5rem] border border-dashed border-ocean/40 px-[1em] py-[1.5em] text-center font-gochi text-sm leading-snug text-charcoal">
          No playlist set yet.
          <br />
          <span className="text-xs">Paste the Spotify share link into PLAYLIST_URL.</span>
        </p>
      )}

      {id && isMobile && (
        <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-[4%] pb-[4%]">
          <div className="h-full min-h-[152px] w-full max-w-[32rem] overflow-hidden rounded-[0.75rem]">
            <iframe
              title="Playlist"
              src={embedSrc(id)}
              className="h-full min-h-[152px] w-full"
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {id && !isMobile && (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Taller than the box it sits in and pinned to the top of it, so what
              overflows is the bottom of the iPod and never the screen. */}
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{ height: `${IPOD_FILL}%`, aspectRatio: `${IPOD.w} / ${IPOD.h}` }}
          >
            {/* Its own element so the zoom has a transform to itself: the box
                outside is holding the translate that centres it, and a keyframe
                setting `transform` would throw that away. */}
            <div
              ref={zoomRef}
              className="relative h-full w-full"
              style={
                from
                  ? {
                      animation: 'treasure-handoff 460ms cubic-bezier(.25,.85,.35,1) both',
                      '--from-x': `${from.dx}px`,
                      '--from-y': `${from.dy}px`,
                      '--from-scale': from.scale,
                      '--from-rot': `${from.rotate}deg`,
                    }
                  : undefined
              }
            >
              <Image
                src={IPOD.src}
                alt="An iPod"
                width={IPOD.w}
                height={IPOD.h}
                sizes="90vh"
                className="pointer-events-none relative z-10 h-full w-full select-none object-contain"
                style={{ filter: 'drop-shadow(0 12px 22px rgba(39, 66, 112, 0.32))' }}
              />

              {/* Over the printed screen, not behind it: unlike the camera's,
                  this screen is painted on rather than cut out, so the player
                  has to cover the artwork's own "Now Playing" rather than show
                  through it. z-20 puts it above the iPod image for that reason. */}
              <div
                ref={screenRef}
                className="absolute z-20 overflow-hidden bg-black"
                style={SCREEN}
              >
                <div
                  style={{
                    width: NATIVE_W,
                    height: NATIVE_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    // Hidden until measured, or it flashes at full size for a
                    // frame before the observer reports back.
                    opacity: scale ? 1 : 0,
                  }}
                >
                  {player}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {id && (
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[1.5%] right-[3%] z-20 rounded-full bg-white/80 px-[0.7em] py-[0.15em] text-right font-gochi text-[0.65rem] text-ocean underline decoration-ocean/40 underline-offset-2 md:text-xs"
        >
          hear them in full on Spotify &rarr;
        </a>
      )}
    </div>
  );
}
