import Image from 'next/image';

// Butter paper, the same tone the wordmark is cut from, so the page reads as
// having been torn off the same pad as the rest of the section rather than as a
// dialog that arrived from somewhere else.
const PAPER = '#EEE5BC';

/**
 * A single project, on a sheet of paper that flies in off the right.
 *
 * `entry` is the corner the *incoming* sheet swings in by — both of them out on
 * the right, by the wheel — and it decides both halves: a sheet on its way out
 * carries on to the opposite corner rather than backing out the way it came, so
 * the pair reads as one orbit. To starboard the sheets run up the right-hand
 * side, in at the bottom and out at the top; to port they run down it. Only the
 * one value is passed in because the other is always its opposite.
 *
 * Both animations use `both` fill mode, so the sheet holds wherever its keyframe
 * left it — in place after arriving, off screen after leaving — instead of
 * snapping back to its untransformed position.
 *
 * The caller is expected to change `animationKey` on every flight. Nothing in
 * React restarts a CSS animation just because a style changed, so the key is what
 * remounts the node and plays it from the first frame; without it a second press
 * in the same direction would sit there doing nothing.
 */
export default function ProjectPage({
  project,
  index,
  total,
  phase,
  entry,
  reduced,
  animationKey,
  inset,
  onClose,
}) {
  if (!project) return null;

  // Out by the far corner from the one the next sheet is coming in by, so the
  // orbit carries on rather than reversing.
  const edge = phase === 'in' ? entry : entry === 'top' ? 'bottom' : 'top';

  return (
    <article
      key={animationKey}
      // Height is the sheet's own rather than the gap between two pinned edges:
      // stretched to the section it was a third blank under the content. Taller
      // on a phone, where the same content stacks into one column and scrolls.
      // Sides come from the caller, which is the only place that knows where the
      // wheel's edge falls.
      // z-[25] drops it between the helm and the water: in front of the wheel,
      // but under the passes that wash across the foot of the section, so the
      // crests break over the bottom of the sheet.
      className="pointer-events-auto absolute z-[25] flex h-[66vh] flex-col overflow-hidden rounded-[0.4rem] border border-navy-dark/10 shadow-[0_18px_45px_rgba(39,66,112,0.28)] md:h-[min(64vh,34rem)]"
      style={{
        ...inset,
        backgroundColor: PAPER,
        // Someone who asked for less movement still gets the page, just without
        // the flight — and 'out' has to stay hidden rather than merely still.
        animation: reduced
          ? 'none'
          : `project-page-${phase}-${edge} ${phase === 'in' ? 720 : 340}ms ${
              // The arrival's curve is deliberately unhurried through its middle.
              // A hard ease-out spends nine tenths of its travel in the first
              // couple of frames, which left the sheet at nine tenths of full
              // size a third of the way in — all that growth happening too fast
              // to register, so the swing read as a plain slide. This one holds
              // the middle and overshoots a touch at the end instead. Departures
              // still just accelerate away; there is nothing to watch there.
              phase === 'in' ? 'cubic-bezier(.32,.72,.35,1.1)' : 'cubic-bezier(.5,0,.75,.1)'
            } both`,
        opacity: reduced && phase === 'out' ? 0 : undefined,
      }}
      aria-labelledby={`project-${project.name}`}
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-navy-dark/15 px-[5%] pt-[3.5%] pb-[2.5%]">
        <div className="flex min-w-0 items-baseline gap-3">
          <h3
            id={`project-${project.name}`}
            className="font-gochi text-2xl leading-none text-navy-dark md:text-4xl"
          >
            {project.name}
          </h3>
          <span className="truncate font-gochi text-sm leading-none text-charcoal md:text-lg">
            {project.tagline}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-gochi text-xs leading-none text-charcoal md:text-sm">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project"
            className="flex h-6 w-6 items-center justify-center rounded-full font-gochi text-lg leading-none text-charcoal transition-colors hover:bg-navy-dark/10"
          >
            ×
          </button>
        </div>
      </header>

      {/* Scrolls on a phone, where the sheet is far shorter than its contents.
          min-h-0 is load-bearing: a flex child defaults to min-height:auto, which
          refuses to shrink below its content, so the overflow never engages and
          the panel grows out of the page instead of scrolling inside it. */}
      {/* Centred rather than top-aligned: the sheet keeps its height while the
          content it carries is now short, and pinning that to the top would leave
          the slack pooled in one gap at the bottom instead of split either side. */}
      <div className="grid min-h-0 flex-1 gap-[4%] overflow-y-auto px-[5%] py-[3.5%] md:grid-cols-[1.15fr_1fr] md:items-top md:overflow-hidden">
        {/* <figure className="overflow-hidden rounded-[0.3rem] border border-navy-dark/15 bg-white/40 shadow-[0_6px_16px_rgba(39,66,112,0.15)]"> */}
          <Image
            src={project.image}
            alt={`${project.name} screenshot`}
            width={project.imageW}
            height={project.imageH}
            sizes="(max-width: 767px) 84vw, 46vw"
            className="h-auto w-full"
          />
        {/* </figure> */}

        <div className="flex min-w-0 flex-col gap-[0.9em]">
          <p className="font-gochi text-base leading-snug text-navy-dark md:text-xl">
            {project.blurb}
          </p>

          <ul className="flex flex-col gap-[0.4em] font-gochi text-sm leading-snug text-navy-dark/90 md:text-base">
            {project.points.map((point) => (
              <li key={point} className="flex gap-[0.5em]">
                <span aria-hidden="true" className="text-ocean">
                  ·
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-[0.4em]">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-ocean/30 bg-ocean/10 px-[0.7em] py-[0.15em] font-gochi text-xs leading-snug text-navy-dark md:text-sm"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap gap-[0.6em] pt-[0.4em]">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ocean px-[1em] py-[0.3em] font-gochi text-sm leading-snug text-butter transition-transform hover:-translate-y-0.5 md:text-base"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
