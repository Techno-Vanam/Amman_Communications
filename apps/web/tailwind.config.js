/** @type {import('tailwindcss').Config} */
/* global module */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', '-apple-system', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        brand: {
          900: '#0a1f15',
          800: '#0f2d1e',
          700: '#12372A',
          600: '#1a4d3a',
          500: '#236649',
          400: '#2e8a60',
          200: '#a8d5b9',
          100: '#d8ebdd',
          50:  '#f0f7f2',
        },
      },
      maxWidth: {
        container: '1200px',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
