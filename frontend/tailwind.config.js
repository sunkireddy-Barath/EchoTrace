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
        // Dark background scale
        'void': '#030712',
        'surface': '#070d1a',
        'surface-2': '#0d1526',
        'surface-3': '#111f38',
        'border': '#1a3060',
        'border-2': '#234080',

        // Text
        'ink': '#e8f0fe',
        'ink-2': '#94afd4',
        'ink-3': '#5b7ba8',

        // Accent
        'neon': '#3b82f6',
        'neon-2': '#60a5fa',
        'neon-glow': 'rgba(59,130,246,0.25)',

        // Threat levels
        'threat-critical': '#ff2d55',
        'threat-high': '#ff6b35',
        'threat-medium': '#ffd60a',
        'threat-low': '#30d158',
        'threat-zeroday': '#bf5af2',

        // Genome colors
        'genome-urgency': '#ef4444',
        'genome-authority': '#8b5cf6',
        'genome-fear': '#dc2626',
        'genome-greed': '#f59e0b',
        'genome-trust': '#06b6d4',
        'genome-credential': '#f97316',
        'genome-payment': '#10b981',
        'genome-digital': '#6366f1',

        // Family colors
        'family-banking': '#ef4444',
        'family-job': '#f97316',
        'family-lottery': '#eab308',
        'family-loan': '#a855f7',
        'family-upi': '#3b82f6',
        'family-phishing': '#10b981',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(59,130,246,0.2)',
        'neon-strong': '0 0 40px rgba(59,130,246,0.4)',
        'threat-high': '0 0 20px rgba(255,107,53,0.3)',
        'threat-critical': '0 0 30px rgba(255,45,85,0.4)',
        'threat-zeroday': '0 0 30px rgba(191,90,242,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow-green': '0 0 20px rgba(48,209,88,0.25)',
      },
      animation: {
        'pulse-threat': 'pulse-threat 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'zeroday': 'zeroday 1.5s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-threat': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.98)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'zeroday': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(191,90,242,0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(191,90,242,0.7)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(226,75,74,0.4)' },
          '50%': { borderColor: 'rgba(226,75,74,0.9)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.12), transparent)',
      },
    },
  },
  plugins: [],
};
