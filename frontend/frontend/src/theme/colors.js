// archivo: src/theme/colors.js
//
// Tokens de marca de Gesco IA — familia visual compartida con GESCO
// (mismo navy corporativo + amarillo "señal" del isotipo).
// Centralizar esto acá evita tener hex sueltos repetidos en cada página;
// si el día de mañana se ajusta un tono, se cambia en un solo lugar.

export const colors = {
  // Fondo base — mismo navy-950 de GESCO
  bgBase: "#0b1830",

  // Escala navy (idéntica a --color-navy-* de GESCO)
  navy950: "#0b1830",
  navy800: "#14294f",
  navy600: "#1f4e85",
  navy500: "#2c62a3",

  // Acento de marca — amarillo "señal" del isotipo
  signal: "#f4e409",
  signalInk: "#6b6300", // versión oscurecida, para texto sobre fondos claros

  // Blancos con transparencia — para texto secundario sobre el fondo oscuro
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.65)",
  textMuted: "rgba(255,255,255,0.45)",
  textFaint: "rgba(255,255,255,0.25)",

  // Superficies de vidrio (glass) sobre el fondo navy
  glassBg: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.10)",

  // Estados
  danger: "#f87171",
  dangerBg: "rgba(248,113,113,0.1)",
  dangerBorder: "rgba(248,113,113,0.3)",
};