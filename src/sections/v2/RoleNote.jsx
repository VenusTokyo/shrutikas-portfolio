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
 * The note that unrolls when a workplace is picked on the map.
 *
 * On a wide screen it is a torn page, with the words laid into the artwork. On a
 * phone it is a plain card, because the artwork cannot be made to work there: the
 * page is 1028x460, so at 92vw it comes out about 359x161, and a header, a quote,
 * a paragraph, four highlights and a footnote do not go into 161px. Text laid
 * over it either overflowed the paper or had to shrink past reading size — every
 * clamp() here pins to its own minimum at that width, because 1.4vw is 5px.
 *
 * So the phone keeps the words and drops the picture. The card is the same warm
 * paper colour and unrolls the same way; it simply takes the height it needs.
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
          className="hidden h-auto w-full select-none drop-shadow-xl md:block"
          style={{ filter: PAPER_FILTER }}
          priority={false}
        />

        {/* A card in its own right on a phone, and a layer over the paper from md
            up. Everything that positions it against the artwork — the absolute
            fill, the deep side insets that dodge the tears — is md-only.

            Opaque, not a tint. The map behind it is dimmed but its pins are not,
            and at 60% the other two workplaces read straight through the card as
            if the note were overlapping them. */}
        <div className="relative flex flex-col gap-2 rounded-[0.7rem] border border-navy-dark/15 bg-[#F5EFDB] px-[6%] py-[6%] text-left text-navy-dark shadow-lg md:absolute md:inset-0 md:gap-[2.6%] md:rounded-none md:border-0 md:bg-transparent md:px-[11%] md:py-[8%] md:shadow-none">
          <header className="flex flex-col items-start gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
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
              <span className="truncate font-gochi text-base leading-none md:text-[clamp(1rem,2.2vw,1.9rem)]">
                {stop.role}
              </span>
            </div>
            <span className="shrink-0 font-gochi text-[0.7rem] leading-none text-charcoal md:text-[clamp(0.58rem,1.15vw,0.95rem)]">
              {stop.dates}
            </span>
          </header>

          <p className="font-gochi text-[0.8rem] italic leading-snug text-charcoal md:text-[clamp(0.68rem,1.4vw,1.12rem)]">
            &ldquo;{stop.blurb}&rdquo;
          </p>

          {/* Capped so the measure stays readable — the paper is wide enough that
              a full-bleed line would run past a comfortable line length. */}
          <p className="font-gochi text-[0.8rem] leading-snug md:max-w-[88%] md:text-[clamp(0.66rem,1.32vw,1.06rem)]">
            {stop.body}
          </p>

          <ul className="flex flex-wrap gap-x-[1em] gap-y-[0.15em] font-gochi text-[0.75rem] leading-snug text-navy-dark/90 md:gap-x-[1.4em] md:gap-y-[0.2em] md:text-[clamp(0.6rem,1.2vw,0.98rem)]">
            {stop.highlights.map((h) => (
              <li key={h} className="flex items-center gap-[0.35em]">
                <span aria-hidden="true" className="text-ocean">
                  ·
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <p className="font-gochi text-[0.75rem] italic leading-snug text-charcoal md:text-[clamp(0.6rem,1.22vw,1rem)]">
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
            className="absolute right-2 top-2 z-10 flex h-7 w-7 md:right-[8%] md:top-[10%] items-center justify-center rounded-full font-gochi text-lg leading-none text-charcoal transition-colors hover:bg-navy-dark/10"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
