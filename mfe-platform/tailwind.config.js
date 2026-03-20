/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        bg: '#080a0f',
        surface: '#0e1118',
        surface2: '#141720',
        accent: '#63dca3',
        accent2: '#f0a04b',
        accent3: '#e05bf0',
        muted: '#666e85',
        danger: '#e05b5b',
        text: '#eef0f6',
      },
    },
  },
  plugins: [],
};
