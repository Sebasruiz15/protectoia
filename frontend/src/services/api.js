// archivo: src/services/api.js
import axios from "axios";

// ── Cliente HTTP ──────────────────────────────────────────────────
export const api = axios.create({
  baseURL:     import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
  timeout:     10_000,
  withCredentials: true,
});

// ── Interceptor request — adjunta token ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor response — normaliza errores ──────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const res    = err.response ?? {};
    const data   = res.data    ?? {};
    const status = res.status  ?? 0;

    // Token expirado — cerrar sesión automáticamente
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("empresa");
      window.location.href = "/login";
    }

    return Promise.reject({
      mensaje: data.mensaje ?? data.message ?? "Error de conexión.",
      status,
      campos:  data.campos  ?? [],
      data,
    });
  }
);