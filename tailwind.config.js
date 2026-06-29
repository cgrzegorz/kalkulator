/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Arial', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#eef7f7',
          100: '#dff1f0',
          200: '#bfe4e2',
          300: '#f5a623',
          500: '#0f766e',
          600: '#0d6b64',
          700: '#17202a',
          800: '#143f43',
          900: '#101820',
        },
      },
      boxShadow: {
        panel: '0 14px 34px rgba(28, 39, 52, .08)',
      },
    },
  },
  plugins: [],
}
