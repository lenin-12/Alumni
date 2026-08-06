/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // This will include all your React components
  ],
  theme: {
    extend: {
      colors: {
        'brand-maroon': {
          DEFAULT: '#3B2214',
          dark: '#2B1810',
          light: '#531010',
        },
        'brand-gold': {
          DEFAULT: '#D4A857',
          light: '#E8C97A',
        },
        'brand-rust': {
          DEFAULT: '#A6491F',
          dark: '#8C3A16',
        },
        'brand-warmgray': {
          DEFAULT: '#8C7D70',
          dark: '#5C5248',
          light: '#FAF6F0',
        }
      }
    },
  },
  plugins: [],
};
