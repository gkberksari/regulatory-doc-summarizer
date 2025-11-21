/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d6e4ff',
          200: '#adc8ff',
          500: '#2563eb',
          700: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
};

