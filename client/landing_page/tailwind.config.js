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
          50: '#f1fbdc',
          100: '#e2f7b8',
          200: '#c5ef71',
          300: '#a8e638',
          400: '#8cdb0d',
          500: '#71d300',
          600: '#71d300',
          700: '#71d300',
          800: '#4d9200',
          900: '#2f5b00',
        },
        emerald: {
          DEFAULT: '#71d300',
          dark: '#4d9200',
          light: '#8cdb0d',
          soft: '#f1fbdc',
          tint: '#f7fde9',
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
        'brand-glow': '0 10px 25px -5px rgba(113, 211, 0, 0.2)',
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
