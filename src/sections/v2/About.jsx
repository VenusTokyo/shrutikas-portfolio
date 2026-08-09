import dynamic from 'next/dynamic';
import Section from './Section';
import Image from 'next/image';
import Highlighter from '../../components/ui/Highlighter';

const Lanyard = dynamic(() => import('./lanyard/Lanyard'), {
  ssr: false,
  loading: () => <p className="font-gochi text-ocean">loading lanyard…</p>,
});

export default function About() {
  return (
    // Grows past a screen on a phone, where the lanyard and the text stack; a
    // fixed height there would crop one or the other.
    <Section id="about" height="h-auto min-h-[100dvh] md:h-[100dvh]">
      <div className="flex h-full w-full flex-col items-start gap-4 py-10 md:flex-row md:gap-0 md:py-0">
        {/* Held to a slice of the viewport on mobile so the text below it is on
            screen at the same time. The camera pulls back to match. */}
        <div className="h-[42vh] w-full shrink-0 md:h-[95vh] md:w-1/2">
          <Lanyard
            position={[0, 0, 12]}
            transparent
            cardAspect={735 / 465}
            overlayImage={encodeURI('/Travel document blue.png')}
            overlayScale={1.15}
            backImage="/thisBarbieIsASoftwareEngineer.png"
            imageFit="contain"
            lanyardWidth={1.5}
          />
        </div>
        <div className="flex h-full w-full flex-col justify-center items-center md:items-start gap-4 md:w-[45%] md:gap-8">
          <Image
            src="/About.svg"
            alt="About"
            width={600}
            height={509}
            className="h-auto w-[80vw] md:w-full"
          />
          <p className='font-gochi mx-4 md:mx-0 text-xl tracking-wide leading-relaxed text-navy-dark sm:text-xl md:text-3xl md:tracking-widest'>She&apos;s a part time artist and a full time Engineer. She enjoys <Highlighter>making pixels and code get along</Highlighter>. When she&apos; not chasing bugs, she&apos; probably choosing the perfect color pallet, doodling in Adobe Fresco or convincing herself the one more feature won&apos; take another 3 hours.</p>
        </div>
      </div>
    </Section>
  );
}
