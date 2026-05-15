/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#E44A28', light: '#FF6B47', dark: '#B83820' },
        dark: {
          bg:     '#020617',
          card:   '#0F172A',
          card2:  '#1E293B',
          border: '#1E293B',
          border2:'#334155',
          muted:  '#64748B',
          text:   '#94A3B8',
        },
        light: {
          bg:     '#F8FAFC',
          card:   '#FFFFFF',
          card2:  '#F1F5F9',
          border: '#E2E8F0',
          border2:'#CBD5E1',
          muted:  '#94A3B8',
          text:   '#64748B',
        }
      },
      fontFamily: {
        sans:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['"Cal Sans"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-accent': 'pulseAccent 2s ease-in-out infinite',
        'skeleton':  'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 },                          to: { opacity: 1 } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:     { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseAccent: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        skeleton:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundSize: { '200%': '200%' },
    }
  },
  plugins: []
}
