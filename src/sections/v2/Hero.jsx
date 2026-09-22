import Image from 'next/image';
import Section from './Section';
import SocialRow from '../../components/ui/SocialRow';

export default function Hero() {
  return (
    <Section id="hero">
      <div className="relative h-full w-full">
        <p className="absolute left-1/2 top-[4%] w-full -translate-x-1/2 text-center font-gochi text-base font-extralight tracking-widest text-navy-dark md:left-[20%] md:top-[6%] md:w-auto md:translate-x-0 md:text-left md:text-2xl">
          Hi, Welcome to the world of
        </p>

        {/* On a phone the three pieces overlap rather than queue up. Shrutika is
            set behind the photograph with their top edges flush, so the lettering
            runs across the shoulders and out to both margins; Shaw signs off
            across the feet, catching the last of the photograph and finishing
            below it. Desktop keeps its own arrangement, which is the same idea
            laid out sideways.

            An earlier pass stacked them in a strict column with no overlap. It
            was legible and completely flat — the name stopped being written on
            the picture and became a caption above it. */}
        <Image
          src="/Shrutika.svg"
          alt="Shrutika"
          width={1710}
          height={468}
          className="absolute left-1/2 top-[24%] z-0 w-[92vw] -translate-x-1/2 md:top-[10%] md:w-[85vw]"
          priority
        />

        {/* Behind Shaw — z-10 against Shaw's z-20 — so the lettering reads over
            the photograph rather than the other way round. */}
        <Image
          src="/heroShrutikaImage.png"
          alt="Shrutika Shaw"
          width={623}
          height={1149}
          className="absolute left-1/2  z-10 w-[56vw] -translate-x-1/2  sm:w-52 top-1/2 md:w-72 -translate-y-1/2"
          priority
        />

        <Image
          src="/Shaw.svg"
          alt="Shaw"
          width={1198}
          height={509}
          className="absolute left-1/2 top-[40%] z-20 w-[96vw] -translate-x-1/2 md:left-[40%] md:top-[45%] md:w-[40vw] md:translate-x-0"
          priority
        />

        <p className="absolute bottom-[15%] left-3 font-gochi text-xl tracking-widest text-navy-dark md:bottom-[7%] md:left-0 md:ml-4 md:text-3xl">
          Software Engineer
        </p>
        <p className="absolute bottom-[10%] left-3 font-gochi text-xl tracking-widest text-navy-dark md:bottom-[2%] md:left-0 md:ml-4 md:text-3xl">
          Artist
        </p>
        {/* inset-x-0 with justify-center, not left-1/2 with a translate. An
            absolutely positioned box with `left: 50%` and `right: auto` is
            shrink-to-fit inside what remains to its right — half the screen, 195px
            on a phone. Four icons fitted; the fifth pushed the flex items to
            shrink and max-width clamped every icon to 28px, which is why they
            looked squashed. Spanning the width removes the constraint. */}
        <SocialRow className="absolute inset-x-0 bottom-[3%] z-30 justify-center gap-3 md:inset-x-auto md:bottom-[4%] md:right-16 md:gap-4" />
      </div>
    </Section>
  );
}
