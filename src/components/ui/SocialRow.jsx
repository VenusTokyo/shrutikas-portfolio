import { SOCIALS, linkProps } from '../../lib/socials';

/**
 * The row of places to find her.
 *
 * Its own component because it appears twice — at the foot of the hero and again
 * in the footer — and the two want the same links at different sizes. `size`
 * carries the icon's classes so the caller decides that without either copy
 * owning the list.
 *
 * A plain img, not next/image: these come from Icons8's CDN, and next/image
 * would want that host declared in next.config before it would load at all.
 */
export default function SocialRow({ className = '', size = 'h-9 w-9 md:h-12 md:w-12' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          {...linkProps(s.href)}
          className="transition-transform hover:-translate-y-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width="48" height="48" src={s.icon} alt={s.label} className={`${size} shrink-0 select-none`} />
        </a>
      ))}
    </div>
  );
}
