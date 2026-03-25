/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          accent: '#06b6d4',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
          orange: '#f97316',
        }
      }
    }
  },
  plugins: [],
}
