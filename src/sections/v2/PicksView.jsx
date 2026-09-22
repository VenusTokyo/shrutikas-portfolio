// Posters come from TMDB's own CDN rather than being copied into the repo.
// Hotlinking a poster from wherever a search engine found it breaks the first
// time that page is reorganised, and self-hosting them means redistributing
// artwork that isn't ours; TMDB serves these deliberately, and asks only for
// credit, which is at the foot of the panel.
//
// The path is the stable part — the segment before it is the size, so one
// constant here changes the resolution of every poster at once.
const POSTER = 'https://media.themoviedb.org/t/p/w342';

// `note` is left empty on purpose. These are meant to read as her recommendations,
// and a line of invented enthusiasm under each one would be putting words in her
// mouth — better an honest list than a fabricated opinion. Fill them in and they
// appear under the title.
const PICKS = [
  {
    title: 'Your Name.',
    original: '君の名は。',
    year: 2016,
    kind: 'Film',
    poster: '/vfJFJPepRKapMd5G2ro7klIRysq.jpg',
    note: '',
  },
  {
    title: 'Fight Club',
    year: 1999,
    kind: 'Film',
    poster: '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
    note: '',
  },
  {
    title: 'Kaguya-sama: Love Is War',
    original: 'かぐや様は告らせたい',
    year: 2019,
    kind: 'Series',
    poster: '/5khbC6AuNgnvnoDbjIMKCOhEtIc.jpg',
    note: '',
  },
  {
    title: 'Parasite',
    original: '기생충',
    year: 2019,
    kind: 'Film',
    poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    note: '',
  },
  {
    title: 'SPY × FAMILY',
    year: 2022,
    kind: 'Series',
    poster: '/7NAvPYPAu7MeHwP8E9sn81PqsRh.jpg',
    note: '',
  },
  {
    title: 'Project Hail Mary',
    year: 2026,
    kind: 'Film',
    poster: '/yihdXomYb5kTeSivtFndMy5iDmf.jpg',
    note: '',
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    kind: 'Film',
    poster: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    note: '',
  },
  {
    // The Ron Howard one with Tom Hanks, not Argento's 1980 film or the 1911
    // Dante. TMDB lists four things under this name, so the id is worth noting:
    // this is 207932.
    title: 'Inferno',
    year: 2016,
    kind: 'Film',
    poster: '/5T6iVetK5AB1kgwAEKbDM2hTZJU.jpg',
    note: '',
  },
];

/**
 * What came off the disc: eight things worth watching.
 *
 * Laid out as a board, the same way the crochet and paint galleries are, so the
 * whole chest reads as one thing. That also settles what kept going wrong when
 * this was a fixed two-row grid: with no scrolling, a poster could only be as
 * tall as half the panel minus its caption, which capped it around 115px wide and
 * left the row looking like thumbnails. A board sizes each poster to the column
 * instead — about 194px here — and lets the second row run past the bottom edge,
 * which is what a board is for.
 *
 * These are all 2:3, so the columns come out level rather than staggered. The
 * masonry is doing no work today; it is here because it costs nothing and the
 * moment a square cover or a wide banner is added it will hold.
 */
export default function PicksView({ reduced, onBack }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col bg-white"
      style={{
        animation: reduced ? 'none' : 'treasure-window-in 420ms cubic-bezier(.25,1.1,.4,1) 220ms both',
      }}
    >
      <header className="flex shrink-0 items-baseline justify-between gap-3 px-[4%] pb-[1.5%] pt-[3%]">
        <div className="flex min-w-0 items-baseline gap-2">
          <h4 className="font-gochi text-xl leading-none text-navy-dark md:text-3xl">On repeat</h4>
          <span className="truncate font-gochi text-xs leading-none text-charcoal md:text-base">
            things she&apos;d make you watch
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

      <div className="min-h-0 flex-1 overflow-y-auto px-[4%]">
        {/* break-inside-avoid on each card keeps a poster from being sliced
            across a column break, which is the one way CSS columns go visibly
            wrong. */}
        <div className="columns-2 gap-[3%] md:columns-4">
          {PICKS.map((pick) => (
            <figure
              key={pick.title}
              className="mb-[3%] w-full break-inside-avoid overflow-hidden rounded-[0.3rem] border border-navy-dark/10 bg-white shadow-[0_3px_10px_rgba(39,66,112,0.18)]"
            >
              {/* A plain img: this is another origin's CDN, and next/image would
                  want it declared in next.config before it would load at all. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${POSTER}${pick.poster}`}
                alt={`${pick.title} poster`}
                loading="lazy"
                className="block h-auto w-full object-cover"
                style={{ aspectRatio: '2 / 3' }}
              />
              <figcaption className="px-[0.55em] py-[0.35em] leading-tight">
                <span className="block font-gochi text-sm text-navy-dark md:text-base">
                  {pick.title}
                </span>
                <span className="block font-gochi text-[0.65rem] text-charcoal md:text-xs">
                  {pick.kind} &middot; {pick.year}
                </span>
                {pick.note && (
                  <span className="mt-[0.2em] block font-gochi text-[0.65rem] leading-snug text-navy-dark/80 md:text-xs">
                    {pick.note}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <p className="shrink-0 px-[4%] pb-[1.5%] pt-[0.5%] text-right font-gochi text-[0.6rem] text-charcoal/70 md:text-[0.7rem]">
        Posters via TMDB
      </p>
    </div>
  );
}
