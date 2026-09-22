// The three Drive folders the easter egg reads from. Public ("anyone with the
// link"), which is what lets an API key alone list them — no OAuth, no consent
// screen, nothing to keep signed in.
export const FOLDERS = {
  paint: '1YrO_K71rsTmE1sSCKslb_L1DqDjzG1Q1',
  crochet: '1RnjCbIshq7vbyptZjuHTi_zBMAEw7kxe',
  memories: '16efAfSmVNX0WsJFKRgjd4bzPcl7yCSQm',
};

// Copies of what was in each folder, committed to the repo. Not the primary
// source — the live listing is — but what gets served when the listing can't be
// had: no key configured, key expired, quota spent, Google having a bad day.
//
// The gallery is behind an easter egg most visitors never reach, so an outage
// here is invisible to almost everyone; the point of the fallback is that when
// someone does find it, they get a gallery rather than an empty box.
export const FALLBACKS = {
  paint: [
    { id: 'chai-portrait', name: 'chai portrait', src: '/treasure/paint/chai-portrait.jpg', width: 1200, height: 1600 },
    { id: 'cow-tote', name: 'cow tote', src: '/treasure/paint/cow-tote.jpg', width: 1200, height: 1280 },
    { id: 'hollow-knight-bench', name: 'hollow knight bench', src: '/treasure/paint/hollow-knight-bench.jpg', width: 1200, height: 1618 },
    { id: 'krishna-conch', name: 'krishna conch', src: '/treasure/paint/krishna-conch.jpg', width: 1200, height: 845 },
    { id: 'mandala', name: 'mandala', src: '/treasure/paint/mandala.jpg', width: 597, height: 839 },
    { id: 'not-a-phase', name: 'not a phase', src: '/treasure/paint/not-a-phase.jpg', width: 1200, height: 1629 },
    { id: 'portrait-flowers', name: 'portrait flowers', src: '/treasure/paint/portrait-flowers.jpg', width: 1200, height: 1600 },
    { id: 'portrait-sunglasses', name: 'portrait sunglasses', src: '/treasure/paint/portrait-sunglasses.jpg', width: 1200, height: 1792 },
    { id: 'starry-shuttle-fabric', name: 'starry shuttle fabric', src: '/treasure/paint/starry-shuttle-fabric.jpg', width: 1080, height: 1758 },
    { id: 'sunset-silhouettes', name: 'sunset silhouettes', src: '/treasure/paint/sunset-silhouettes.jpg', width: 1200, height: 1149 },
  ],
  crochet: [
    { id: 'crochet-a', name: 'crochet a', src: '/treasure/crochet/crochet-a.jpg', width: 1200, height: 1600 },
    { id: 'crochet-b', name: 'crochet b', src: '/treasure/crochet/crochet-b.jpg', width: 1200, height: 2133 },
    { id: 'crochet-c', name: 'crochet c', src: '/treasure/crochet/crochet-c.jpg', width: 900, height: 1600 },
    { id: 'embroidered-fawn', name: 'embroidered fawn', src: '/treasure/crochet/embroidered-fawn.jpg', width: 1200, height: 1060 },
    { id: 'embroidery-bee-wreath', name: 'embroidery bee wreath', src: '/treasure/crochet/embroidery-bee-wreath.jpg', width: 720, height: 1148 },
    { id: 'orange-pouch', name: 'orange pouch', src: '/treasure/crochet/orange-pouch.jpg', width: 1080, height: 1440 },
  ],
  memories: [
    { id: 'mem-01', name: 'mem 01', src: '/treasure/memories/mem-01.jpg', width: 1200, height: 1600 },
    { id: 'mem-02', name: 'mem 02', src: '/treasure/memories/mem-02.jpg', width: 1200, height: 1600 },
    { id: 'mem-03', name: 'mem 03', src: '/treasure/memories/mem-03.jpg', width: 1200, height: 900 },
    { id: 'mem-04', name: 'mem 04', src: '/treasure/memories/mem-04.jpg', width: 1200, height: 1600 },
    { id: 'mem-05', name: 'mem 05', src: '/treasure/memories/mem-05.jpg', width: 1200, height: 801 },
    { id: 'mem-06', name: 'mem 06', src: '/treasure/memories/mem-06.jpg', width: 1200, height: 900 },
    { id: 'mem-07', name: 'mem 07', src: '/treasure/memories/mem-07.jpg', width: 1200, height: 900 },
    { id: 'mem-08', name: 'mem 08', src: '/treasure/memories/mem-08.jpg', width: 1200, height: 1600 },
  ],
};

// The size asked of Drive's CDN. next/image resizes again on the way through, so
// this only has to be large enough to be the best source it will ever need —
// past about this the extra pixels are thrown away.
export const DRIVE_WIDTH = 1600;

export const driveSrc = (id) => `https://lh3.googleusercontent.com/d/${id}=w${DRIVE_WIDTH}`;
