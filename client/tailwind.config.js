/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "#D71920", 
          "primary-hover": "#B01217", 
          "secondary-green": "#059669", 
          "metal-silver": "#E5E7EB", 
          "charcoal": "#1F2937",
          "background-light": "#F9FAFB", 
          "background-dark": "#030712", 
          "surface-dark": "#111827", 
        },
        fontFamily: {
          "display": ["Manrope", "sans-serif"]
        },
        borderRadius: {
          "DEFAULT": "1rem", 
          "lg": "2rem", 
          "xl": "3rem"
        },
        backgroundImage: {
          'hero-gradient': 'linear-gradient(rgba(3, 7, 18, 0.7), rgba(3, 7, 18, 0.9))',
          'glass-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
          'glass-gradient-dark': 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/container-queries'),
    ],
  }