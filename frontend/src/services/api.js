// archivo: src/services/api.js
import axios from 'axios';

/*
  Instancia base de axios.
  Como configuramos el proxy en vite.config.js, en dev no necesitas
  la URL completa — '/api/...' llega al backend en localhost:3001.
  En producción, VITE_API_URL apunta al dominio real.
*/
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de request ───────────────────────────────────────
// Agrega el token JWT a cada petición si el usuario está autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor de response ──────────────────────────────────────
// Normaliza los errores para que todos los componentes reciban el mismo formato
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data    = error.response?.data;
    const status  = error.response?.status;

    // Si el token expiró (401), limpiamos sesión y redirigimos
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('empresa');
      window.location.href = '/login';
    }

    // Lanzamos un error con forma conocida para consumir en los componentes:
    // catch(err) → err.mensaje, err.status, err.campos
    return Promise.reject({
      mensaje: data?.error ?? 'Error de conexión. Verifica tu internet.',
      status,
      campos: data?.campos ?? [], // errores de validación campo a campo
    });
  }
);