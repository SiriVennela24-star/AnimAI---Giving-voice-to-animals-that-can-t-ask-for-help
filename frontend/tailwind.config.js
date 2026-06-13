/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#07070A',
          card: 'rgba(20, 15, 35, 0.45)', // Translucent glassmorphism violet surface
          border: 'rgba(138, 43, 226, 0.2)', // Border color for cards
          magenta: '#FF007F', // Neon magenta
          violet: '#8A2BE2', // Bright violet
          cyan: '#00F0FF', // Neon cyan accents
          gray: '#A0A0B0', // Subdued text gray
        }
      },
      boxShadow: {
        'neon-magenta': '0 0 15px rgba(255, 0, 127, 0.5)',
        'neon-violet': '0 0 15px rgba(138, 43, 226, 0.5)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
