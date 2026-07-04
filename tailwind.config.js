/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavanda: {
          50:  '#f5f4f8',
          100: '#eceaf3',
          200: '#d8d5e8',
          300: '#bdbad5',
          400: '#9e9bbd',
          500: '#847fa5',
          600: '#6A6781',
          700: '#585570',
          800: '#46445c',
          900: '#363448',
          950: '#1d1c2a',
        },
        dourado: {
          50:  '#FCF1EE',
          100: '#FAE0D6',
          200: '#F8BFAA',
          300: '#F69774',
          400: '#F6794C',
          500: '#F45F27',
          600: '#C73D0A',
          700: '#B33709',
          800: '#902D09',
          900: '#712509',
          950: '#451808',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-lavanda': 'linear-gradient(135deg, #585570 0%, #6A6781 50%, #847fa5 100%)',
        'gradient-gold': 'linear-gradient(135deg, #B33709 0%, #F45F27 50%, #F69774 100%)',
        'gradient-hero': 'linear-gradient(160deg, #1d1c2a 0%, #363448 30%, #6A6781 70%, #847fa5 100%)',
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(244, 95, 39, 0.3)',
        'gold-lg': '0 8px 40px rgba(244, 95, 39, 0.4)',
        'lavanda': '0 4px 24px rgba(106, 103, 129, 0.3)',
        'lavanda-lg': '0 8px 40px rgba(106, 103, 129, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 95, 39, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(244, 95, 39, 0)' },
        },
      },
    },
  },
  plugins: [],
}
