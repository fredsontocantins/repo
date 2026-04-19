/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fb',
          100: '#dbe7f3',
          200: '#b8cfe6',
          300: '#8eb1d4',
          400: '#5e8abb',
          500: '#3a6aa2',
          600: '#22518a',
          700: '#193e6b',
          800: '#112a4a',
          900: '#0a1a30',
        },
        accent: {
          50: '#f5f7fa',
          100: '#e4e8ef',
          200: '#c7cfdb',
          300: '#9faabc',
          400: '#6e7d94',
          500: '#4c5a72',
          600: '#3a4557',
          700: '#2c3442',
          800: '#1e242e',
          900: '#12161d',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
