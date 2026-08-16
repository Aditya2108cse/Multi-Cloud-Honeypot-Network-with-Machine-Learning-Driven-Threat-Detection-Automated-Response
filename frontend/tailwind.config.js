/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EAF6EA',
          100: '#D5ECD6',
          200: '#AAD9AD',
          300: '#7FC684',
          400: '#54B35B',
          500: '#67B86B',
          600: '#397A45',
          700: '#2D6136',
          800: '#214827',
          900: '#162F18',
        },
        beige: {
          50: '#FDFBF7',
          100: '#F8F5EF',
          200: '#F3EFE6',
          300: '#E8E2D5',
          400: '#DCD4C4',
          500: '#D0C8B3',
        },
        dark: {
          50: '#F7F8F7',
          100: '#EBECEB',
          200: '#D7D9D7',
          300: '#B3B8B3',
          400: '#8F968F',
          500: '#737A74',
          600: '#5E645E',
          700: '#4A4E4A',
          800: '#3A3D3A',
          900: '#1F2923',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '22px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(31, 41, 35, 0.06), 0 1px 3px rgba(31, 41, 35, 0.04)',
        'card-hover': '0 8px 24px rgba(31, 41, 35, 0.1), 0 4px 12px rgba(31, 41, 35, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'progress': 'progress 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
    },
  },
  plugins: [],
}