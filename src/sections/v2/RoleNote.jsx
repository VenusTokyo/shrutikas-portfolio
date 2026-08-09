import Image from 'next/image';

// encodeURI: the filename has a space in it.
const TORN_PAGE = encodeURI('/torn page.png');
const TORN_W = 1028;
const TORN_H = 460;

// Warms the paper towards butter and knocks the contrast back, so it reads as
// aged notepaper behind the text rather than a photograph of card.
const PAPER_FILTER = 'sepia(0.32) saturate(1.15) brightness(1.07) contrast(0.9)';

// Base height every org mark is scaled from, so they stay in proportion to the
// panel rather than sitting at a fixed pixel size.
const LOGO_HEIGHT = 'clamp(1.3rem, 2.8vw, 2.4rem)';

/**
 * The torn page that unrolls when a workplace is picked on the map.
 *
 * `stop` is kept rendered while closing so the text doesn't vanish before the
 * page has finished rolling back up.
 */
export default function RoleNote({ stop, open, reduced, pinned, onClose }) {
  if (!stop) return null;

  // Rolling, not just fading: the page hinges from its top edge, so rotateX with
  // a perspective reads as paper unfurling downward rather than a box scaling up.
  const rolled = 'perspective(1600px) rotateX(-82deg) scaleY(0.55)';
  const unrolled = 'perspective(1600px) rotateX(0deg) scaleY(1)';

  return (
    <div
      className="absolute left-1/2 top-1/2 z-40 w-[min(92vw,1000px)] -translate-x-1/2 -translate-y-1/2"
      style={{
        transformOrigin: 'top center',
        transform: `translate(-50%, -50%) ${open || reduced ? unrolled : rolled}`,
        opacity: open ? 1 : 0,
        transition: reduced
          ? 'none'
          : 'transform 640ms cubic-bezier(.18,.85,.25,1), opacity 300ms ease-out',
        pointerEvents: open ? 'auto' : 'none',
      }}
      role="dialog"
      aria-modal="false"
      aria-label={`${stop.company} — ${stop.role}`}
    >
      <div className="relative">
        <Image
          src={TORN_PAGE}
          alt=""
          width={TORN_W}
          height={TORN_H}
          sizes="(max-width: 1000px) 92vw, 1000px"
          className="h-auto w-full select-none drop-shadow-xl"
          style={{ filter: PAPER_FILTER }}
          priority={false}
        />

        {/* Reads top-down and flush left, so every line starts on the same edge as
            the logo. Side insets stay generous — the tears bite deepest there. */}
        <div className="absolute inset-0 flex flex-col gap-[2.6%] px-[11%] py-[8%] text-left text-navy-dark">
          <header className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-[0.6em]">
              {/* Sized by height, not width: both logos are wide wordmarks with
                  different aspects (4.33 vs 3.93), so a shared width would render
                  them at different heights, and a fixed width leaves them a
                  sliver. Height keeps them evenly weighted next to the role text,
                  with each mark's own logoScale trimming for the padding baked
                  into its artwork. */}
              <Image
                src={stop.logo}
                alt={`${stop.company} logo`}
                width={stop.logoW}
                height={stop.logoH}
                className="w-auto shrink-0 object-contain"
                style={{ height: `calc(${LOGO_HEIGHT} * ${stop.logoScale ?? 1})` }}
              />
              <span className="truncate font-gochi text-[clamp(1rem,2.2vw,1.9rem)] leading-none">
                {stop.role}
              </span>
            </div>
            <span className="shrink-0 font-gochi text-[clamp(0.58rem,1.15vw,0.95rem)] leading-none text-charcoal">
              {stop.dates}
            </span>
          </header>

          <p className="font-gochi text-[clamp(0.68rem,1.4vw,1.12rem)] italic leading-snug text-charcoal">
            &ldquo;{stop.blurb}&rdquo;
          </p>

          {/* Capped so the measure stays readable — the paper is wide enough that
              a full-bleed line would run past a comfortable line length. */}
          <p className="max-w-[88%] font-gochi text-[clamp(0.66rem,1.32vw,1.06rem)] leading-snug">
            {stop.body}
          </p>

          <ul className="flex flex-wrap gap-x-[1.4em] gap-y-[0.2em] font-gochi text-[clamp(0.6rem,1.2vw,0.98rem)] leading-snug text-navy-dark/90">
            {stop.highlights.map((h) => (
              <li key={h} className="flex items-center gap-[0.35em]">
                <span aria-hidden="true" className="text-ocean">
                  ·
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <p className="font-gochi text-[clamp(0.6rem,1.22vw,1rem)] italic leading-snug text-charcoal">
            📌 {stop.note}
          </p>
        </div>

        {/* Only meaningful once the note is pinned open by a click — on hover it
            closes itself when the pointer leaves. */}
        {pinned && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close note"
            className="absolute right-[8%] top-[10%] flex h-7 w-7 items-center justify-center rounded-full font-gochi text-lg leading-none text-charcoal transition-colors hover:bg-navy-dark/10"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
