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
          50:  '#f4f1fb',
          100: '#e8e3f8',
          200: '#d4c9f2',
          300: '#b8a8e8',
          400: '#9d87db',
          500: '#8b7ec8',
          600: '#7B68AE',
          700: '#6B5CA5',
          800: '#574a87',
          900: '#473d6e',
          950: '#2a2340',
        },
        dourado: {
          50:  '#fdf9e7',
          100: '#faf0c4',
          200: '#f5e08b',
          300: '#eeca4a',
          400: '#e5b420',
          500: '#D4AF37',
          600: '#B8960C',
          700: '#967a0b',
          800: '#7b6311',
          900: '#685213',
          950: '#3c2d06',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-lavanda': 'linear-gradient(135deg, #6B5CA5 0%, #8b7ec8 50%, #9d87db 100%)',
        'gradient-gold': 'linear-gradient(135deg, #B8960C 0%, #D4AF37 50%, #eeca4a 100%)',
        'gradient-hero': 'linear-gradient(160deg, #2a2340 0%, #47396e 30%, #6B5CA5 70%, #8b7ec8 100%)',
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 40px rgba(212, 175, 55, 0.4)',
        'lavanda': '0 4px 24px rgba(107, 92, 165, 0.3)',
        'lavanda-lg': '0 8px 40px rgba(107, 92, 165, 0.4)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
        },
      },
    },
  },
  plugins: [],
}
