/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farmGreen: '#28a745',
        farmDark: '#1a1a1a',
        farmLight: '#f8f9fa',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

