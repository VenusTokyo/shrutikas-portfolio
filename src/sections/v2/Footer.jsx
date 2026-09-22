import Image from "next/image";
import SocialRow from "../../components/ui/SocialRow";

// The two wordmarks were sized in fixed pixels — 400 and 200 — which is a width
// the phone does not have: the section is 375 across there, so Shrutika filled it
// edge to edge and Shaw's last letter was cut off by the right margin. Both are
// a share of the viewport now, capped at the sizes they used to be so nothing
// changes on a wide screen.
export default function Footer() {
    return (
        <section
            style={{
                backgroundImage:
                    'radial-gradient(rgba(238, 229, 188, 0.35) 1.5px, transparent 1.5px)',
                backgroundSize: '40px 40px',
            }}
            className="relative w-full bg-ocean h-[60svh]">
            <Image
                src="/Shrutika.svg"
                alt="Shrutika"
                width={400}
                height={468}

                style={{
                    filter: 'brightness(0) saturate(100%) invert(97%) sepia(4%) saturate(2645%) hue-rotate(331deg) brightness(103%) contrast(87%)'
                }}
                className="absolute left-1/2 top-[16%] h-auto w-[86vw] max-w-[400px] -translate-x-1/2 md:top-[22%]"
            />
            <Image
                src="/Shaw.svg"
                alt="Shaw"
                width={200}
                height={468}
                style={{
                    filter: 'brightness(0) saturate(100%) invert(97%) sepia(4%) saturate(2645%) hue-rotate(331deg) brightness(103%) contrast(87%)'
                }}
                className="absolute left-[56%] top-[38%] h-auto w-[46vw] max-w-[200px] -translate-x-1/2 md:left-[48%] md:top-[44%] md:translate-x-0"
            />
            {/* Stacked in flow at the bottom rather than each pinned to its own
                percentage from the floor. Two absolutely placed blocks a few
                percent apart collide the moment either one changes height — which
                the sign-off does, since it is one line on a wide screen and two
                on a phone. */}
            <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-3 px-4 md:bottom-[6%] md:gap-4">
                <SocialRow className="gap-3 md:gap-4" size="h-8 w-8 md:h-10 md:w-10" />

                {/* Two lines on a phone, one on a wider screen. The separator
                    belongs to the joined-up version and would sit at the head of
                    the second line otherwise. */}
                <p className="text-center font-gochi text-base tracking-wider text-butter md:text-lg">
                    <span className="block md:inline">Hand-drawn with love ❤</span>
                    <span className="hidden md:inline"> | </span>
                    <span className="block md:inline">Shrutika Shaw © 2026</span>
                </p>
            </div>
        </section>
    );
}
