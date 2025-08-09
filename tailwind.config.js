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
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#6b705c',
        secondary: '#e5989b',
        accent: '#b7b7a4',
        ink: '#0b0b0b'
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } }
      },
      animation: {
        'fade-up': 'fade-up 1s ease-out forwards',
        'spin-slow': 'spin-slow 40s linear infinite',
        'marquee': 'marquee 40s linear infinite'
      }
    }
  },
  plugins: []
}