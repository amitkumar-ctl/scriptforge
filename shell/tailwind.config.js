/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
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
        muted: '#a8b0c0',
        danger: '#e05b5b',
        platform: {
          yt: '#ff4545',
          ig: '#e040fb',
          tiktok: '#00f5d4',
          linkedin: '#4fa3e0',
          podcast: '#f0a04b',
          twitter: '#5bc8e0',
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #63dca3 0%, #1a9a6a 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'spin-slow': 'spin 0.8s linear infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,220,163,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99,220,163,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
