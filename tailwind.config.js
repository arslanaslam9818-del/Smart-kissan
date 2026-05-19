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
          light: '#4ade80', // green-400
          DEFAULT: '#16a34a', // green-600
          dark: '#14532d', // green-900
        },
        earth: {
          light: '#fde68a', // amber-200
          DEFAULT: '#d97706', // amber-600
          dark: '#78350f', // amber-900
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
