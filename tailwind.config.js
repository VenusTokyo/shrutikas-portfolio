const { colors } = require('./src/theme/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/sections/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: colors.bg.paper,
        'paper-warm': colors.bg.paperWarm,
        navy: colors.ink.navy,
        blue: colors.ink.blue,
        plum: colors.ink.plum,
        sage: colors.ink.sage,
        muted: colors.ink.muted,
        'hi-pink': colors.highlight.pink,
        'hi-lime': colors.highlight.lime,
        'hi-butter': colors.highlight.butter,
        'hi-sky': colors.highlight.sky,
        'pantone-blue': colors.pantone.blue,
        'pantone-pink': colors.pantone.pink,
        'pantone-orange': colors.pantone.orange,
        'pantone-green': colors.pantone.green,
        // v2 palette. `navy` is already taken above by the v1 blue (#2c4a8c),
        // hence the distinct names here.
        ocean: '#4289cb',
        butter: '#EEE5BC',
        ink: '#1e2a38',
        'navy-dark': '#274270', // body copy
        charcoal: '#39434A', // small text — captions, dates
      },
      fontFamily: {
        burtons: 'burtons',
        display: ['var(--font-playfair)', '"Playfair Display"', 'serif'],
        hand: ['var(--font-caveat)', '"Caveat"', 'cursive'],
        body: ['var(--font-garamond)', '"EB Garamond"', 'serif'],
        marker: ['var(--font-kalam)', '"Kalam"', 'cursive'],
        // v2 paragraph font
        gochi: ['var(--font-gochi)', '"Gochi Hand"', 'cursive'],
      },
    },
  },
  plugins: [],
};
