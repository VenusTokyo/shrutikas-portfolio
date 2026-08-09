import Image from 'next/image';
import Section from './Section';

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shrutika-shaw/', icon: 'https://img.icons8.com/doodle/48/linkedin--v2.png' },
  { label: 'GitHub', href: 'https://github.com/VenusTokyo', icon: 'https://img.icons8.com/doodle/48/github--v1.png' },
  { label: 'Email', href: 'mailto:shrutika.shaw2015@gmail.com', icon: 'https://img.icons8.com/doodle/48/gmail.png' },
  { label: 'X', href: 'https://x.com/QuiteIronical', icon: 'https://img.icons8.com/doodle/48/twitter-circled.png' },
];

export default function Hero() {
  return (
    <Section id="hero">
      <div className="relative h-full w-full">
        <p className="absolute left-1/2 top-[18%] w-full -translate-x-1/2 text-center font-gochi text-base font-extralight tracking-widest text-navy-dark md:left-[20%] md:top-[6%] md:w-auto md:translate-x-0 md:text-left md:text-2xl">
          Hi, Welcome to the world of
        </p>

        {/* On a phone the two names stack about the middle of the screen; on
            desktop they keep their original offset arrangement. */}
        <Image
          src="/Shrutika.svg"
          alt="Shrutika"
          width={1710}
          height={468}
          className="absolute left-1/2 top-[28%] z-0 w-[99vw] -translate-x-1/2 md:top-[10%] md:w-[85vw]"
          priority
        />

        {/* Behind Shaw — z-10 against Shaw's z-20 — so the lettering reads over
            the photograph rather than the other way round. */}
        <Image
          src="/heroShrutikaImage.png"
          alt="Shrutika Shaw"
          width={623}
          height={1149}
          className="absolute left-1/2 top-[50%] z-10 w-72 -translate-x-1/2 -translate-y-1/2 sm:w-52 md:top-1/2 md:w-72"
          priority
        />

        <Image
          src="/Shaw.svg"
          alt="Shaw"
          width={1198}
          height={509}
          className="absolute left-1/2 top-[45%] z-20 w-[80vw] -translate-x-1/2 md:left-[40%] md:top-[45%] md:w-[40vw] md:translate-x-0"
          priority
        />

        <p className="absolute bottom-[15%] left-3 font-gochi text-xl tracking-widest text-navy-dark md:bottom-[7%] md:left-0 md:ml-4 md:text-3xl">
          Software Engineer
        </p>
        <p className="absolute bottom-[12%] left-3 font-gochi text-xl tracking-widest text-navy-dark md:bottom-[2%] md:left-0 md:ml-4 md:text-3xl">
          Artist
        </p>

        <div className="absolute bottom-[3%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 md:bottom-[4%] md:left-auto md:right-16 md:translate-x-0 md:gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target={s.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={s.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="transition-transform hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img width="48" height="48" src={s.icon} alt={s.label} className="h-9 w-9 md:h-12 md:w-12" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
