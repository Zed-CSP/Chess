/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chess board colors
        'board-light': '#f0d9b5',
        'board-dark': '#b58863',
        'board-highlight': '#ffff00',
        'board-check': '#ff6b6b',
        'board-move': '#90ee90',
        
        // Brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // Game status colors
        'win': '#22c55e',
        'loss': '#ef4444',
        'draw': '#f59e0b',
        'playing': '#3b82f6',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      animation: {
        'piece-move': 'piece-move 0.3s ease-in-out',
        'board-flip': 'board-flip 0.6s ease-in-out',
        'check-pulse': 'check-pulse 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      
      keyframes: {
        'piece-move': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'board-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'check-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      
      boxShadow: {
        'board': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'piece': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'game-card': '0 2px 12px rgba(0, 0, 0, 0.1)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}; 