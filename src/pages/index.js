import Head from 'next/head';
import Hero from '../sections/v2/Hero';
import About from '../sections/v2/About';
import Experience from '../sections/v2/Experience';
import Bag from '../sections/v2/Bag';
import Contact from '../sections/v2/Contact';
import Footer from '../sections/v2/Footer';
import Projects from '../sections/v2/Projects';

// Absolute, and it has to be. A link preview is fetched by a crawler that has no
// page to resolve a relative path against — "/og.png" is simply dropped, which is
// why the card came back with a title, a description and a blank square.
const SITE_URL = 'https://shrutika.space';
const OG_IMAGE = `${SITE_URL}/og.png`;
const TITLE = "Shrutika's World";
const DESCRIPTION = 'A small corner of the internet, the portfolio of Shrutika Shaw.';
// Parked until it has content — the section file is still in place.
// import JunkDrawer from '@/sections/v2/JunkDrawer';

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* What a crawler reads. Facebook, LinkedIn, WhatsApp, Slack and Discord
            all take the og: set; X wants its own, and summary_large_image is the
            difference between the wide card and a small thumbnail beside the
            text. The dimensions are declared so the card can be laid out before
            the image itself has finished downloading. */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={TITLE} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Shrutika Shaw, hand-lettered across a photograph, above the words Software Engineer and Artist"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:creator" content="@QuiteIronical" />
      </Head>
      <main className="min-h-screen overflow-x-hidden bg-butter/10 text-navy-dark [background-image:radial-gradient(rgba(66,137,203,0.35)_1.5px,transparent_1.5px)] [background-size:40px_40px]">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Bag />
        {/* <JunkDrawer /> */}
        <Contact />
        <Footer />
      </main>
    </>
  );
}
