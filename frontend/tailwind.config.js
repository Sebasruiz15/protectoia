// archivo: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // Solo genera CSS de las clases que realmente usas
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Paleta de marca IA System Grup — úsala con: bg-brand-900, text-brand-500, etc.
      colors: {
        brand: {
          50:  '#E6F1FB',
          100: '#C0D9F4',
          200: '#8FBDE9',
          300: '#5EA1DD',
          400: '#3888D3',
          500: '#185FA5',
          600: '#0C447C',
          700: '#083259',
          800: '#042136',
          900: '#021018',
        },
      },
      fontFamily: {
        // Inter como fuente principal — la importamos en index.css
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Bordes consistentes en toda la app
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};