/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        treinadores: {
          red: '#B91C1C', // Vermelho forte
          darkRed: '#7F1D1D', // Vermelho escuro para bordas
          panel: '#1F2937', // Cinza escuro para os painéis
          bg: '#111111'
        }
      },
      fontFamily: {
        pixel: ['Volter', 'sans-serif'], // Agora usa a sua fonte!
      }
    },
  },
  plugins: [],
}