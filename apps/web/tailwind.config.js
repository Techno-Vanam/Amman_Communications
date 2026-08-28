/* eslint-disable no-undef */
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
          900: '#062117',
          800: '#0c3a29',
          700: '#11523b',
          600: '#176b4d',
          500: '#1d825e',
          400: '#47aa89',
          300: '#75bfa6',
          200: '#a3d5c3',
          100: '#d1eae0',
          50:  '#e8f5f0',
        },
        emerald: {
          DEFAULT: '#176b4d',
          dark: '#11523b',
          light: '#1d825e',
          soft: '#e8f5f0',
          tint: '#f2f9f6',
        },
        accent: {
          amber: '#f59e0b',
          amberSoft: '#fef3c7',
          sky: '#0ea5e9',
          skySoft: '#e0f2fe',
          violet: '#6366f1',
          violetSoft: '#e0e7ff',
          rose: '#f43f5e',
          roseSoft: '#ffe4e6',
        },
      },
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.06)',
        'brand-glow': '0 10px 25px -5px rgba(23, 107, 77, 0.2)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
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
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
