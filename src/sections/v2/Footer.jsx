import Image from "next/image";

export default function Footer() {
    return (
        <section
            style={{
                backgroundImage:
                    'radial-gradient(rgba(238, 229, 188, 0.35) 1.5px, transparent 1.5px)',
                backgroundSize: '40px 40px',
            }}
            className="relative w-full bg-ocean h-[60dvh]">
            <Image
                src="/Shrutika.svg"
                alt="Shrutika"
                width={400}
                height={468}

                style={{
                    filter: 'brightness(0) saturate(100%) invert(97%) sepia(4%) saturate(2645%) hue-rotate(331deg) brightness(103%) contrast(87%)'
                }}
                className="absolute left-1/2 -translate-x-1/2 top-[25%]"
            />
            <Image
                src="/Shaw.svg"
                alt="Shaw"
                width={200}
                height={468}
                style={{
                    filter: 'brightness(0) saturate(100%) invert(97%) sepia(4%) saturate(2645%) hue-rotate(331deg) brightness(103%) contrast(87%)'
                }}
                className="absolute left-[48%] top-[48%]"
            />
            <p className="text-butter tracking-wider font-gochi text-lg absolute left-1/2 -translate-x-1/2 bottom-[10%]">Hand-drawn with love ❤ | Shrutika Shaw © 2026</p>
        </section>
    );
}
