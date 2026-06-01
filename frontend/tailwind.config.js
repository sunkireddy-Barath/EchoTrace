/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#0a0f1e',
        'cyber-card': '#0d1526',
        'cyber-card2': '#111827',
        'cyber-border': '#1e293b',
        'cyber-accent': '#6366f1',
        'cyber-accent2': '#818cf8',
        'cyber-text': '#e2e8f0',
        'cyber-muted': '#94a3b8',
        'threat-high': '#ef4444',
        'threat-medium': '#f59e0b',
        'threat-low': '#10b981',
        'threat-high-bg': 'rgba(239,68,68,0.1)',
        'threat-medium-bg': 'rgba(245,158,11,0.1)',
        'threat-low-bg': 'rgba(16,185,129,0.1)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'threat-pulse': 'threat-pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'threat-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
