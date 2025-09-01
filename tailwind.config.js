/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        'card': '237 / 659', // Card aspect ratio
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}