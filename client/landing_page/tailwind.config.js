/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f5f0',
          100: '#d1eae0',
          200: '#a3d5c3',
          300: '#75bfa6',
          400: '#47aa89',
          500: '#1d825e',
          600: '#176b4d', // Soft professional medium green
          700: '#11523b',
          800: '#0c3a29',
          900: '#062117',
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.06)',
        'brand-glow': '0 10px 25px -5px rgba(23, 107, 77, 0.2)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
