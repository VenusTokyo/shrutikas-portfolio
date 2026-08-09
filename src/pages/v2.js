import Head from 'next/head';
import Hero from '../sections/v2/Hero';
import About from '../sections/v2/About';
import Experience from '../sections/v2/Experience';
import Bag from '../sections/v2/Bag';
import Contact from '../sections/v2/Contact';
// Parked until they have content — the section files are still in place.
// import Projects from '@/sections/v2/Projects';
// import JunkDrawer from '@/sections/v2/JunkDrawer';

export default function V2() {
  return (
    <>
      <Head>
        <title>Shrutika&apos;s Digital Scrapbook</title>
        <meta
          name="description"
          content="A small corner of the internet — the digital scrapbook portfolio of Shrutika Shaw."
        />
      </Head>
      <main className="min-h-screen overflow-x-hidden bg-butter/10 text-navy-dark [background-image:radial-gradient(rgba(66,137,203,0.35)_1.5px,transparent_1.5px)] [background-size:40px_40px]">
        <Hero />
        <About />
        <Experience />
        {/* <Projects /> */}
        <Bag />
        {/* <JunkDrawer /> */}
        <Contact />
      </main>
    </>
  );
}
