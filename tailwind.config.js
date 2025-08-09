/**
 * Tailwind CSS configuration
 *
 * This file tells Tailwind where to find your HTML and TypeScript
 * template files so it can generate the appropriate utility classes.
 */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6b705c', // earthy green
        secondary: '#e5989b', // soft pink
        accent: '#b7b7a4', // warm beige
      },
      animation: {
        'pulse-slow': 'pulse 4s infinite',
      }
    },
  },
  plugins: [],
};