import { useEffect, useState } from 'react';
import Image from 'next/image';

// Enough of a caption to be worth printing. Drive only knows a filename, and a
// machine-made one — "IMG 20180605 102104", "PhotoGrid Plus 1653670563942" — is
// noise rather than a title, so those are left off instead of stamped under the
// picture. Keyed off a long run of digits rather than a list of known camera
// prefixes: such a list is never complete, but a timestamp always looks like one.
const isRealName = (name) => Boolean(name) && !/\d{6}/.test(name);

/**
 * A board of pictures from one Drive folder.
 *
 * Laid out with CSS columns rather than a grid. A grid has to be told how many
 * rows each picture spans, which means knowing every aspect ratio up front and
 * recomputing them on resize; columns let each picture keep its own shape and
 * flow. That is the Pinterest arrangement, and it survives a folder of mixed
 * portrait and landscape phone photos without being told anything about them.
 *
 * The trade is reading order: columns fill downward before moving right, so this
 * is a board to browse rather than a sequence to read. For a wall of pictures
 * that is the right way round.
 */
export default function GalleryView({ kind, title, subtitle, folderUrl, reduced, onBack }) {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    // Guards a fetch that outlives the panel: closing the gallery mid-flight
    // would otherwise set state on something no longer mounted.
    let alive = true;
    setItems(null);
    setFailed(false);
    setOpen(null);
    fetch(`/api/gallery?kind=${kind}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((data) => alive && setItems(data.items || []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [kind]);

  const shown = open === null ? null : items && items[open];
  const step = (by) => setOpen((i) => (i + by + items.length) % items.length);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col bg-white"
      style={{
        animation: reduced
          ? 'none'
          : 'treasure-window-in 420ms cubic-bezier(.25,1.1,.4,1) 220ms both',
      }}
    >
      <header className="flex shrink-0 items-baseline justify-between gap-3 px-[4%] pb-[1.5%] pt-[3%]">
        <div className="flex min-w-0 items-baseline gap-2">
          <h4 className="font-gochi text-xl leading-none text-navy-dark md:text-3xl">{title}</h4>
          <span className="truncate font-gochi text-xs leading-none text-charcoal md:text-base">
            {subtitle}
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
        {items === null && !failed && (
          // Blocks shaped like a board rather than a spinner, so the panel does
          // not lurch when the real pictures land.
          <div className="columns-2 gap-[3%] md:columns-4">
            {[62, 88, 70, 96, 58, 80].map((h, i) => (
              <div
                key={`${h}-${i}`}
                className="mb-[3%] w-full animate-pulse rounded-[0.3rem] bg-navy-dark/10"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}

        {failed && (
          <p className="py-[12%] text-center font-gochi text-sm text-charcoal">
            Couldn&apos;t reach the album just now.
          </p>
        )}

        {items && items.length > 0 && (
          <div className="columns-2 gap-[3%] md:columns-4">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(i)}
                // break-inside-avoid keeps a picture from being sliced across a
                // column break, which is the one way CSS columns go visibly wrong.
                className="mb-[3%] block w-full break-inside-avoid overflow-hidden rounded-[0.3rem] border border-navy-dark/10 bg-white shadow-[0_3px_10px_rgba(39,66,112,0.18)] transition-transform hover:-translate-y-0.5"
              >
                <Image
                  src={item.src}
                  alt={isRealName(item.name) ? item.name : title}
                  width={item.width || 800}
                  height={item.height || 1000}
                  sizes="(max-width: 767px) 42vw, 18vw"
                  className="h-auto w-full"
                />
                {isRealName(item.name) && (
                  <span className="block px-[0.5em] py-[0.3em] text-left font-gochi text-[0.65rem] leading-tight text-charcoal md:text-xs">
                    {item.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {items && items.length === 0 && (
          <p className="py-[12%] text-center font-gochi text-sm text-charcoal">Nothing here yet.</p>
        )}
      </div>

      {folderUrl && (
        <a
          href={folderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-[4%] pb-[2%] pt-[1%] text-right font-gochi text-[0.65rem] text-ocean underline decoration-ocean/40 underline-offset-2 md:text-xs"
        >
          see them all &rarr;
        </a>
      )}

      {/* One picture, big. Deliberately not wired to Escape: the chest already
          uses that key to put the held item down, and two listeners on the same
          key would race to be the one that handled it. */}
      {shown && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy-dark/80 p-[3%]">
          <button
            type="button"
            aria-label="Dismiss picture"
            onClick={() => setOpen(null)}
            className="absolute inset-0 cursor-default"
          />
          <Image
            src={shown.src}
            alt={isRealName(shown.name) ? shown.name : title}
            width={shown.width || 1200}
            height={shown.height || 1600}
            sizes="90vw"
            className="relative max-h-full w-auto max-w-full rounded-[0.3rem] object-contain"
          />
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous picture"
                onClick={() => step(-1)}
                className="absolute left-[2%] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 font-gochi text-xl leading-none text-navy-dark transition-colors hover:bg-white"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                aria-label="Next picture"
                onClick={() => step(1)}
                className="absolute right-[2%] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 font-gochi text-xl leading-none text-navy-dark transition-colors hover:bg-white"
              >
                &rsaquo;
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close picture"
            className="absolute right-[2%] top-[2%] z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 font-gochi text-lg leading-none text-navy-dark transition-colors hover:bg-white"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
