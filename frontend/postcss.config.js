// archivo: postcss.config.js
// PostCSS es el procesador que corre Tailwind y Autoprefixer
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Agrega prefijos -webkit-, -moz- automáticamente
  },
};