// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F9FBF9', // Off-White
        'text': '#3B3B3A',       // Charcoal
        'primary': '#C7006F',    // Magenta (Primary Action / Error)
        'secondary': '#1FB1AB',  // Teal (Secondary Action / Success)

        // Keeping these for potential future use, but basing them on the new theme
        'border': '#E5E7EB',     // A light gray border
        'input': '#FFFFFF',      // White input background
        'muted': {
          foreground: '#6B7280', // A muted gray for helper text
        },
      },
    },
  },
  plugins: [],
};