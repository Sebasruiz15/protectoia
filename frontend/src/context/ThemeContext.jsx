// archivo: src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getPreferenciaOS = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem("tema");
    return guardado ?? getPreferenciaOS();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const guardado = localStorage.getItem("tema");
      if (!guardado) setTema(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggleTema = () =>
    setTema((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTema = () => useContext(ThemeContext);