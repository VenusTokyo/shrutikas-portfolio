import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const FRONT = { src: '/treasure/DigiCam.png', w: 263, h: 171 };
const BACK = { src: '/treasure/cameraBack.png', w: 634, h: 431 };

// The screen in cameraBack.png is a genuine hole — alpha 0, not white paint — so
// a photograph placed behind the artwork shows through it. Measured off the
// image rather than guessed: scanning row 230 gives
// T[0-24] O[26-75] T[78-440] O[443-610] T[612-633], and the column at x=250
// gives the same story vertically. Hole: x 78..440, y 103..373 of 634x431.
const HOLE = {
  left: `${(78 / 634) * 100}%`,
  top: `${(103 / 431) * 100}%`,
  width: `${(362 / 634) * 100}%`,
  height: `${(270 / 431) * 100}%`,
};

// The four-way pad, as a share of the artwork. The two arms that matter are the
// left and right of it; they are invisible hit areas laid over the printed
// arrows rather than drawn controls, so the artwork stays the artwork.
// Measured, not guessed: the dial is a 99px circle centred at (527, 275) in the
// 634x431 artwork, so its arms sit about a third of that diameter either side of
// the middle. The hit areas are a little larger than the printed arrows, which
// costs nothing and makes them findable on a touchscreen.
const PAD = { cx: 83.12, cy: 63.81, armDx: 5.2, armW: 6.4, armH: 9.5 };

// Front, edge-on, back. The middle beat is the whole trick: the front shrinks to
// nothing across its own vertical axis, and the back opens from nothing in the
// same place, so the two read as one object turning over rather than two images
// being swapped.
const HOLD_MS = 340;
const HALF_MS = 260;

/**
 * The camera, turned over to show what is on it.
 *
 * Photographs come from the memories folder on Drive, same endpoint as the
 * galleries, so adding one to that folder adds it here.
 */
export default function CameraView({ reduced, onBack }) {
  const [turn, setTurn] = useState(reduced ? 2 : 0);
  const [photos, setPhotos] = useState(null);
  const [index, setIndex] = useState(0);
  // Whether the pad has been pressed yet. The hint exists to say the wheel does
  // something; once it has been used it is saying something already known, and a
  // light that keeps pulsing after you have learned what it means is just noise.
  const [padUsed, setPadUsed] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    if (reduced) return undefined;
    timers.current = [
      setTimeout(() => setTurn(1), HOLD_MS),
      setTimeout(() => setTurn(2), HOLD_MS + HALF_MS),
    ];
    const running = timers.current;
    return () => running.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    let alive = true;
    fetch('/api/gallery?kind=memories')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((data) => alive && setPhotos(data.items || []))
      .catch(() => alive && setPhotos([]));
    return () => {
      alive = false;
    };
  }, []);

  const count = photos ? photos.length : 0;
  const photo = count ? photos[index % count] : null;
  const step = (by) => {
    setPadUsed(true);
    setIndex((i) => (i + by + count) % count);
  };

  // One light, on the side that moves the roll forward. Two of them said "these
  // are controls" but not "press this", and a symmetrical pair on a symmetrical
  // dial mostly reads as decoration. One asks for a specific press.
  const hint = (
    <span
      aria-hidden="true"
      // Kept inside the hit area rather than spilling past it. The arms are only
      // 36px apart on a 107px dial, so anything larger covers the control it is
      // pointing at instead of sitting on it.
      //
      // White in the middle rather than blue all through, because a light is
      // brightest at its centre whatever colour it is; blue alone at this size
      // just tints the silver underneath. The blur softens the edge so it reads
      // as a glow and not as a drawn circle.
      className="pointer-events-none absolute inset-[6%] rounded-full"
      style={{
        background:
          'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(150,215,255,0.85) 28%, rgba(66,137,203,0.55) 55%, rgba(66,137,203,0) 76%)',
        filter: 'blur(1.5px)',
        animation: reduced ? 'none' : 'pad-hint-pulse 1.9s ease-in-out infinite',
        opacity: reduced ? 0.5 : undefined,
      }}
    />
  );

  const face = (visible) => ({
    transform: `scaleX(${visible ? 1 : 0})`,
    transition: reduced ? 'none' : `transform ${HALF_MS}ms cubic-bezier(.4,0,.3,1)`,
  });

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white px-[1.5%] md:px-[4%]"
      style={{
        animation: reduced
          ? 'none'
          : 'treasure-window-in 380ms cubic-bezier(.25,1.1,.4,1) 180ms both',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute right-[3%] top-[3%] z-20 rounded-full border border-ocean/30 px-[0.9em] py-[0.2em] font-gochi text-xs leading-snug text-navy-dark transition-colors hover:bg-ocean/10 md:text-sm"
      >
        back
      </button>

      {/* Sized by the back's aspect, because the back is what you look at. The
          front is a slightly different shape and simply sits inside the same box
          — matching the box to each face in turn would make the flip change size
          halfway through, which is the one thing that would give it away. */}
      {/* Sized to the room there is rather than to a fixed maximum. The 34rem
          cap this used to carry was the thing actually deciding the size — it
          bound at 544px while the panel had room for about 750 — and it dated
          from when the window still had padding around a smaller stage.

          88% is where the height runs out, not the width: the artwork is 1.47:1,
          so this comes to about 510px tall, and the line underneath needs roughly
          another 34. */}
      {/* Nearly edge to edge on a phone. The camera is a 1.47:1 landscape object
          in a portrait window, so its size is decided by the width and nothing
          else — every percent given back to padding comes straight off the
          photograph, which is only 57% of the artwork's width to begin with. */}
      <div className="relative w-[97%] md:w-[88%]" style={{ aspectRatio: `${BACK.w} / ${BACK.h}` }}>
        <div className="absolute inset-0 flex items-center justify-center" style={face(turn === 0)}>
          <Image
            src={FRONT.src}
            alt="A digital camera"
            width={FRONT.w}
            height={FRONT.h}
            className="h-full w-full select-none object-contain"
            style={{ filter: 'drop-shadow(0 10px 18px rgba(39, 66, 112, 0.3))' }}
          />
        </div>

        <div className="absolute inset-0" style={face(turn === 2)}>
          {/* Behind the artwork, so the hole in it frames the photograph. A dark
              backing under the picture stands in for an LCD: the photographs are
              a mix of upright and sideways, and a portrait one in this landscape
              frame has to letterbox against something. */}
          <div className="absolute overflow-hidden rounded-[2px] bg-[#15171a]" style={HOLE}>
            {photo && (
              <Image
                key={photo.id}
                src={photo.src}
                alt={`Memory ${index + 1} of ${count}`}
                width={photo.width || 1200}
                height={photo.height || 900}
                sizes="40vw"
                className="h-full w-full object-contain"
              />
            )}
            {photos && count === 0 && (
              <p className="flex h-full items-center justify-center font-gochi text-xs text-white/60">
                no photos
              </p>
            )}
          </div>

          <Image
            src={BACK.src}
            alt=""
            width={BACK.w}
            height={BACK.h}
            className="pointer-events-none relative z-10 h-full w-full select-none object-contain"
            style={{ filter: 'drop-shadow(0 10px 18px rgba(39, 66, 112, 0.3))' }}
          />

          {/* Laid over the arrows already printed on the pad. Only live once the
              camera has finished turning, or they would be catching clicks aimed
              at a face that is edge-on. */}
          {turn === 2 && count > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                style={{
                  left: `${PAD.cx - PAD.armDx}%`,
                  top: `${PAD.cy}%`,
                  width: `${PAD.armW}%`,
                  height: `${PAD.armH}%`,
                }}
              />
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                style={{
                  left: `${PAD.cx + PAD.armDx}%`,
                  top: `${PAD.cy}%`,
                  width: `${PAD.armW}%`,
                  height: `${PAD.armH}%`,
                }}
              >
                {!padUsed && hint}
              </button>
            </>
          )}
        </div>
      </div>

      {turn === 2 && count > 0 && (
        <p className="mt-[1.5%] font-gochi text-xs text-charcoal md:text-sm">
          {index + 1} / {count} &nbsp;·&nbsp; the arrows on the pad turn the roll
        </p>
      )}
    </div>
  );
}

