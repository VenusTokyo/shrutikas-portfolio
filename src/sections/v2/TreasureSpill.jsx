import Image from 'next/image';
import { useIsMobile } from '../../hooks/useIsMobile';

// What tipped out of the chest. x/y are the resting centre as a share of the
// stage, `size` the width as a share of the stage's width, so the whole pile
// holds together at any window size.
//
// The arrangement is a heap rather than a row: every item overlaps at least one
// neighbour, which is what makes it read as things that fell out together. Laid
// out apart, at a size that fitted them all side by side, they read as five
// separate stickers placed on a board.
//
// `layer` is the stacking order within the heap, and it follows what the objects
// are rather than the order they are listed: the flat things — the palette, the
// disc — lie underneath, and the objects with bulk sit on top, which is how a
// pile actually settles.
//
// `spin` is the angle it tumbles in at and `rest` the one it settles at, both
// handed to the keyframes as custom properties, which is what lets five items
// with five different tumbles share one animation.
//
// `focus` is the width it takes when brought to the middle. Set per item rather
// than shared, because these are wildly different shapes: one number would leave
// the palette filling the stage and the camera stranded in the middle of it.
//
// `phone` is the same five numbers again for a portrait stage, and they are
// larger than they look like they should be. The portrait stage is twice as tall
// as it is wide, so items sized to a comfortable share of the *width* end up with
// a lot of empty height between them and read as five things placed apart rather
// than as one heap. They have to be big enough to touch.
// The heap is laid
// out in percentages of a box that is 1.6 wide on a desktop and 0.5 wide on a
// phone, so one set of coordinates cannot serve both: read against the tall box,
// the wide arrangement stretches into a vertical line with gaps between the
// items, which stops being a heap and becomes a list.
//
// encodeURI on the palette because its filename has spaces in it.
const ITEMS = [
  {
    key: 'palette',
    phone: { x: 36, y: 68, size: 80, focus: 92 },
    label: 'Paint',
    src: encodeURI('/treasure/pallet and paint brush.png'),
    w: 900,
    h: 675,
    x: 20,
    y: 80,
    size: 55,
    layer: 4,
    focus: 52,
    spin: -38,
    rest: 0,
    delay: 150,
  },
  {
    key: 'cdrom',
    phone: { x: 20, y: 28, size: 60, focus: 72 },
    label: 'CD-ROM',
    src: '/treasure/CD-ROM.png',
    w: 730,
    h: 730,
    x: 29,
    y: 36,
    size: 34,
    layer: 2,
    focus: 40,
    spin: 44,
    rest: -12,
    delay: 210,
  },
  {
    key: 'crochet',
    phone: { x: 80, y: 38, size: 70, focus: 62 },
    label: 'Crochet',
    src: '/treasure/crochet.png',
    w: 667,
    h: 1000,
    x: 75,
    y: 30,
    size: 60,
    layer: 3,
    focus: 30,
    spin: 30,
    rest: -40,
    delay: 300,
  },
  {
    key: 'digicam',
    phone: { x: 40, y: 50, size: 60, focus: 82 },
    label: 'Digicam',
    src: '/treasure/DigiCam.png',
    w: 263,
    h: 171,
    x: 55,
    y: 45,
    size: 35,
    layer: 4,
    focus: 45,
    spin: -38,
    rest: -7,
    delay: 0,
  },
  {
    key: 'ipod',
    phone: { x: 70, y: 80, size: 44, focus: 52 },
    label: 'iPod',
    src: '/treasure/ipod.png',
    // 555x916, matching the cropped file. It was left at the old square 1200x1200
    // after the crop, which had the heap reserve a square for a tall thin object
    // and shift everything around it once the real picture loaded.
    w: 555,
    h: 916,
    x: 63,
    y: 100,
    size: 30,
    layer: 5,
    // Lower than the others on purpose. This is the one portrait item, so width
    // buys height fast: at 44 it stood 673px tall in a 580px stage and had its
    // head and feet clipped on the way to the middle.
    focus: 36,
    // Its panel draws the same object, so it hands over rather than being
    // covered: the panel opens from exactly this spot and this size, and this
    // one stays put underneath instead of sliding to the middle first. Without
    // it you see the iPod move, then a second iPod arrive somewhere else.
    handoff: true,
    spin: -26,
    rest: 14,
    delay: 90,
  },
];

// How far each item has to fall, worked out rather than picked.
//
// translateY percentages are the element's own height, so one shared "-150%"
// means something different for every item: the crochet is tall, so it swung in
// from far overhead, while the little camera moved barely its own height and
// simply appeared where it was going. That is what stopped it reading as falling.
//
// The stage is a 16:10 box, so an item's height as a share of the stage's height
// is its width share times 1.6 times its own aspect. From there the distance is
// how far above the top edge it has to start, and the drop is that distance
// expressed back in the item's own heights, which is the unit the keyframes want.
const STAGE_WIDE = 16 / 10;
// 96vw against 88svh, which is what the window comes out at on a phone.
const STAGE_PHONE = 0.5;

// How far clear of the top edge an item begins, in stage heights. The stage clips,
// so this is simply where it is out of sight.
const CLEAR = 10;

const FALL_BASE_MS = 900;

// How long the chest gets to itself before the first thing leaves the top of the
// window. Without it the sink and the fall start on the same frame and read as
// one event rather than as the chest giving something up — you want to see it
// start going down, and then see what came out of it.
const LEAD_MS = 220;

// Published so a panel that draws the same object can start from where that
// object actually is. Read at the point the panel opens rather than baked into
// it, so moving something in the heap moves where its panel grows from too.
export const HEAP = Object.fromEntries(
  ITEMS.map((i) => [i.key, { x: i.x, y: i.y, size: i.size, rest: i.rest }])
);

const build = (aspect, phone) =>
  ITEMS.map((raw) => {
    const item = phone && raw.phone ? { ...raw, ...raw.phone } : raw;
    const heightPct = item.size * aspect * (item.h / item.w);
    const distance = item.y + heightPct / 2 + CLEAR;
    return {
      ...item,
      drop: -(distance / heightPct) * 100,
      // Something that falls further takes longer, and the square root is the
      // real relationship. One duration for all five lands them together on the
      // same beat, which is the one thing a handful of tipped-out objects never
      // does.
      duration: Math.round(FALL_BASE_MS * Math.min(1.3, Math.max(0.78, Math.sqrt(distance / 115)))),
    };
  });

const FALLING_WIDE = build(STAGE_WIDE, false);
const FALLING_PHONE = build(STAGE_PHONE, true);

// When the last thing has stopped moving, which is what the chest waits on.
// The longer of the two, so the chest never calls the spill finished while one
// of them is still in the air.
export const SPILL_MS = Math.max(
  ...[...FALLING_WIDE, ...FALLING_PHONE].map((i) => i.delay + i.duration)
);

const FOCUS_MS = 520;

/**
 * The five things from the chest: falling, at rest in a heap, and brought to the
 * middle.
 *
 * `focused` is owned by the caller rather than here, because Escape has to mean
 * "put this back" while something is held and "close the window" otherwise — and
 * only the caller knows about the window.
 */
export default function TreasureSpill({ settled, focused, onFocus, onBack, reduced }) {
  const isMobile = useIsMobile();
  const items = isMobile ? FALLING_PHONE : FALLING_WIDE;

  return (
    <div className="absolute inset-0">
      {items.map((item) => {
        const isFocused = focused === item.key;
        const dimmed = focused !== null && !isFocused;
        // Picked up and brought to the middle — unless its panel is going to
        // grow out of it where it lies, in which case it must not move at all.
        // It needs no fade either: the panel is opaque and covers it.
        const lifted = isFocused && !item.handoff;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => (isFocused ? onBack() : onFocus(item.key))}
            aria-label={isFocused ? `Put ${item.label} back` : `Look at ${item.label}`}
            // The important modifiers are deliberate: z-index and the lift are
            // set inline below, and an inline style beats a plain class. Now that
            // the items overlap, whichever one you are pointing at has to come to
            // the front or you cannot tell which you are about to pick up.
            className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-sm hover:!z-[30] focus-visible:!z-[30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/60"
            style={{
              // Held in the middle, or back where it landed. Transitioning the
              // box itself rather than a transform: the heap is laid out in
              // percentages of a stage whose pixel size isn't known here, and a
              // transform can only be told about the element's own size.
              left: lifted ? '50%' : `${item.x}%`,
              top: lifted ? '50%' : `${item.y}%`,
              // Floored in rem as well as sized in percent. The heap is laid out
              // against the stage, and the stage on a phone is a third the width
              // it is on a desktop — the same percentages put the smaller items
              // under the size a finger can reliably hit. The floor only ever
              // bites on small screens.
              width: lifted ? `${item.focus}%` : `max(${item.size}%, 4.5rem)`,
              zIndex: isFocused ? 20 : item.layer,
              opacity: dimmed ? 0 : 1,
              pointerEvents: dimmed ? 'none' : 'auto',
              // The fall runs once on arrival; after that the item is just a box
              // that moves when it is picked up. Both want `transform`, so they
              // are kept apart in time rather than in space — the animation is
              // dropped the moment the spill is over.
              animation:
                settled || reduced
                  ? 'none'
                  : `treasure-item-fall ${item.duration}ms linear ${item.delay}ms both`,
              transition: reduced
                ? 'none'
                : `left ${FOCUS_MS}ms cubic-bezier(.3,.9,.3,1), top ${FOCUS_MS}ms cubic-bezier(.3,.9,.3,1), width ${FOCUS_MS}ms cubic-bezier(.3,.9,.3,1), opacity 260ms ease-out, transform 260ms ease-out`,
              transform: `translate(-50%, -50%) rotate(${lifted ? 0 : item.rest}deg)`,
              '--spin': `${item.spin}deg`,
              '--rest': `${item.rest}deg`,
              '--drop': `${item.drop}%`,
            }}
          >
            <Image
              src={item.src}
              alt={item.label}
              width={item.w}
              height={item.h}
              sizes="(max-width: 767px) 50vw, 40vw"
              className="h-auto w-full select-none transition-transform duration-200 group-hover:scale-[1.06]"
              style={{
                // Follows the artwork's own alpha, so the cut-outs get a shadow
                // shaped to the object while the two photographed-on-white ones
                // get a card's edge. One treatment, and neither looks like a
                // mistake next to the other. It also does the work of separating
                // the items now that they lie on top of one another.
                filter: 'drop-shadow(0 10px 18px rgba(39, 66, 112, 0.35))',
              }}
            />
          </button>
        );
      })}

      {/* Names the thing you are holding, and says how to put it down. Sits
          under the item rather than over it, and never while the spill is still
          in the air. */}
      {focused !== null && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[2%] z-30 text-center font-gochi text-sm text-charcoal md:text-base">
          {items.find((i) => i.key === focused).label} — click it again to put it back
        </p>
      )}
    </div>
  );
}
