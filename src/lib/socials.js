// The one list of places to find her, shared by the hero and the footer. It used
// to live inside Hero, which meant the footer could not show the same set without
// copying it — and a copied list is a list that drifts.
//
// The icons are Icons8's doodle set, which is hand-drawn like everything else
// here. Buy Me a Coffee has no mark in that set (`buy-me-a-coffee` 404s), so it
// borrows the coffee cup, which says the same thing and is drawn by the same
// hand — a brand mark from a different set would be the thing that looked wrong.
const icon = (name) => `https://img.icons8.com/doodle/48/${name}.png`;

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shrutika-shaw/', icon: icon('linkedin--v2') },
  { label: 'GitHub', href: 'https://github.com/VenusTokyo', icon: icon('github--v1') },
  { label: 'Email', href: 'mailto:shrutika.shaw2015@gmail.com', icon: icon('gmail') },
  { label: 'X', href: 'https://x.com/QuiteIronical', icon: icon('twitter-circled') },
  { label: 'Buy me a coffee', href: 'https://buymeacoffee.com/venustokyo', icon: icon('coffee-to-go') },
];

// mailto: has nowhere to open to, so it keeps the current tab and needs no
// opener guard; everything else leaves the site.
export const linkProps = (href) =>
  href.startsWith('mailto:')
    ? {}
    : { target: '_blank', rel: 'noopener noreferrer' };
