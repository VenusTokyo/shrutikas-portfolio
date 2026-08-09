// Font-family stacks for the digital scrapbook. Each leads with the CSS
// variable injected by next/font (see src/pages/_app.js) and falls back to the
// named Google font, then a generic family.
export const fonts = {
  // Big editorial headings
  display: "var(--font-playfair), 'Playfair Display', serif",
  // Handwritten accents, captions, stickers
  hand: "var(--font-caveat), 'Caveat', cursive",
  // Body copy
  body: "var(--font-garamond), 'EB Garamond', serif",
  // Marker / journal scrawl
  marker: "var(--font-kalam), 'Kalam', cursive",
};
