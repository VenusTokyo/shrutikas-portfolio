import { prepare, layout } from '@chenglou/pretext';

const cache = new Map();

function cacheKey(text, font, options) {
  return `${font}::${options?.whiteSpace ?? 'normal'}::${options?.wordBreak ?? 'normal'}::${text}`;
}

export function measureBlock(text, font, maxWidth, lineHeight, options) {
  const key = cacheKey(text, font, options);
  let prepared = cache.get(key);
  if (!prepared) {
    prepared = prepare(text, font, options);
    cache.set(key, prepared);
  }
  return layout(prepared, maxWidth, lineHeight);
}
