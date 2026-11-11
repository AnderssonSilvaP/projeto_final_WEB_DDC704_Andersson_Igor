/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        chess: {
          darkest: 'var(--bg-darkest)',
          darker: 'var(--bg-darker)',
          dark: 'var(--bg-app)',
          panel: 'var(--bg-panel)',
          card: 'var(--bg-card)',
          cardHover: 'var(--bg-hover)',
          border: 'var(--border-color)',
          borderLight: 'var(--border-light)',
          green: 'var(--accent-primary)',
          greenHover: 'var(--accent-hover)',
          greenDark: 'var(--accent-shadow)',
          greenDeep: 'var(--accent-shadow)',
          gold: '#e5b338',
          goldHover: '#f5c64c',
          red: '#fa4141',
          redDark: '#b82525',
          blue: '#3b82f6',
          purple: '#a855f7',
          gray: 'var(--text-secondary)',
          light: 'var(--text-body)',
          boardLight: '#f0d9b5',
          boardDark: '#b58863',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'chess-btn': '0 4px 0 var(--accent-shadow)',
        'chess-btn-active': '0 2px 0 var(--accent-shadow)',
        'chess-dark-btn': '0 4px 0 var(--border-color)',
        'chess-dark-btn-active': '0 2px 0 var(--border-color)',
        'chess-gold-btn': '0 4px 0 #a37f20',
        'chess-card': '0 4px 12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
