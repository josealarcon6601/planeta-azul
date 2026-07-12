/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Montserrat"', 'system-ui', 'sans-serif'] },
      colors: {
        // Paleta de marca de planeta-azul.com (navy #06193f + dorado National Geographic #e1af5b)
        blue: {
          50:  '#eef1f6',
          100: '#d6dde8',
          200: '#aebbd1',
          300: '#8299ba',
          400: '#4d6690',
          500: '#2c4570',
          600: '#16305a',
          700: '#0c2350',
          800: '#081b45',
          900: '#06193f',
          950: '#040f28',
        },
        gold: {
          50:  '#fdf8ef',
          100: '#faeed4',
          200: '#f3dba9',
          300: '#ecc87d',
          400: '#e6b862',
          500: '#e1af5b',
          600: '#cf9a3e',
          700: '#ab7c30',
          800: '#8a632a',
          900: '#725124',
        },
      },
    },
  },
  plugins: []
}
