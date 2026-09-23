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
// Empty on purpose, all three of them.
//
// These used to hold a bundled copy of every gallery, served whenever the live
// Drive listing could not be had — no key configured, key expired, quota spent,
// Google having a bad day. The copies are gone: they were 7.7MB of her own
// photographs and artwork sitting in a public repo, duplicating a Drive folder
// that is already the source of truth and already the only thing that gets
// updated when she adds something.
//
// The trade is real and worth stating. There is no offline copy any more, so a
// failed listing now means an empty gallery rather than a stale one. The shape
// is kept so the endpoint still has something to fall back *to* and callers
// never see undefined.
export const FALLBACKS = {
  paint: [],
  crochet: [],
  // Deliberately empty. The other two keep a local set for when Drive cannot be
  // reached, but these are personal photographs and do not belong in the repo —
  // they are the one gallery whose only copy is the Drive folder. If the fetch
  // fails the camera says "no photos" rather than showing something stale.
  memories: [],
};

// The size asked of Drive's CDN. next/image resizes again on the way through, so
// this only has to be large enough to be the best source it will ever need —
// past about this the extra pixels are thrown away.
export const DRIVE_WIDTH = 1600;

export const driveSrc = (id) => `https://lh3.googleusercontent.com/d/${id}=w${DRIVE_WIDTH}`;
