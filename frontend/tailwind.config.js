/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf4ff',
          100: '#d0e4ff',
          200: '#a6cfff',
          300: '#7db9ff',
          400: '#5a9eff',
          500: '#3f84ff',
          600: '#1d63db',
          700: '#154fab',
          800: '#0f357f',
          900: '#0a224f',
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
