// archivo: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // Solo genera CSS de las clases que realmente usas
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Paleta de marca IA System Group — familia visual compartida con GESCO
      // (mismo navy corporativo + amarillo "señal" del isotipo).
      // Úsala con: bg-brand-900, text-brand-500, bg-signal, text-signal, etc.
      colors: {
        brand: {
          50:  '#EAF1FB',
          100: '#CBDCF3',
          200: '#9CC0E7',
          300: '#6FA3DB',
          400: '#4884C0',
          500: '#2c62a3', // navy-500 de GESCO
          600: '#1f4e85', // navy-600 de GESCO
          700: '#14294f', // navy-800 de GESCO
          800: '#0f2140',
          900: '#0b1830', // navy-950 de GESCO — fondo base compartido
        },
        // Acento de marca heredado del isotipo GESCO (arcos de señal amarillos)
        signal: {
          DEFAULT: '#f4e409',
          ink: '#6b6300', // versión oscurecida, para texto sobre fondos claros
        },
      },
      fontFamily: {
        // Inter como fuente de cuerpo — la importamos en index.html
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Space Grotesk para títulos — mismo par tipográfico que GESCO
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
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