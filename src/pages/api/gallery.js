import { FOLDERS, FALLBACKS, driveSrc } from '../../lib/galleries';

// Kept server-side on purpose. The browser never sees it, which is the whole
// reason this can be a plain API key rather than an OAuth dance: a key shipped
// in the bundle is a key anyone can lift and spend your quota with.
const KEY = process.env.GOOGLE_DRIVE_API_KEY;

// Drive is asked once an hour at most. The folder changes when she adds a photo,
// which is rare; every request going upstream would spend quota on an answer
// that hasn't changed. Held in module scope, so it survives between requests on
// a warm serverless instance and simply refills on a cold one.
const TTL_MS = 60 * 60 * 1000;
const cache = new Map();

async function listFolder(kind) {
  const folderId = FOLDERS[kind];
  if (!folderId || !KEY) return null;

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    key: KEY,
    // Dimensions come back too, so the board can reserve the right space before a
    // picture arrives — masonry with no aspect to go on reflows as each loads.
    fields: 'files(id,name,imageMediaMetadata(width,height,rotation))',
    orderBy: 'name',
    pageSize: '100',
  });

  // Drive can be slow, and this sits in front of a click. Better a fast fallback
  // than a gallery that hangs on a spinner.
  const controller = new AbortController();
  const bail = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.files) || data.files.length === 0) return null;
    return data.files.map((f) => {
      const meta = f.imageMediaMetadata || {};
      // Drive reports the sensor dimensions and the rotation separately but
      // serves the picture already turned. Rotation is in quarter turns, so an
      // odd one means the served image has its axes swapped from what the
      // metadata says. Taken at face value, every portrait phone shot gets a
      // landscape box and the whole column jumps when it loads.
      const turned = meta.rotation === 1 || meta.rotation === 3;
      return {
        id: f.id,
        // The filename is all Drive knows about a picture, so it has to carry the
        // caption. Extension stripped, separators turned back into spaces.
        name: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        src: driveSrc(f.id),
        width: (turned ? meta.height : meta.width) || null,
        height: (turned ? meta.width : meta.height) || null,
      };
    });
  } catch {
    // Aborted, offline, malformed — all the same answer: use what we shipped.
    return null;
  } finally {
    clearTimeout(bail);
  }
}

export default async function handler(req, res) {
  const kind = String(req.query.kind || '');
  if (!FOLDERS[kind]) return res.status(400).json({ error: 'Unknown gallery' });

  const hit = cache.get(kind);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return res.status(200).json({ items: hit.items, source: hit.source, cached: true });
  }

  const live = await listFolder(kind);
  const items = live ?? FALLBACKS[kind];
  const source = live ? 'drive' : 'bundled';
  cache.set(kind, { items, source, at: Date.now() });

  // A fallback answer is cached far more briefly — it means something was wrong,
  // and an hour is a long time to keep being wrong once the key is fixed.
  res.setHeader('Cache-Control', live ? 's-maxage=3600' : 's-maxage=60');
  return res.status(200).json({ items, source });
}
