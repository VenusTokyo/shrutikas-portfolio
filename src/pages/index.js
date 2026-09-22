import Head from 'next/head';
import Hero from '../sections/v2/Hero';
import About from '../sections/v2/About';
import Experience from '../sections/v2/Experience';
import Bag from '../sections/v2/Bag';
import Contact from '../sections/v2/Contact';
import Footer from '../sections/v2/Footer';
import Projects from '../sections/v2/Projects';
// Parked until it has content — the section file is still in place.
// import JunkDrawer from '@/sections/v2/JunkDrawer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Shrutika&apos;s World</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="description"
          content="A small corner of the internet, the portfolio of Shrutika Shaw."
        />
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
