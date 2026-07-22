// archivo: src/services/api.js
import axios from "axios";

// ── Cliente HTTP ──────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
  timeout: 10_000,
});

// ── Interceptor request — adjunta token ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Usuarios mock ─────────────────────────────────────────────────
const USUARIOS_MOCK = [
  {
    email:    "demo@gesco.co",
    password: "Demo2026*",
    token:    "demo-token-local",
    empresa: {
      id:           "demo-001",
      razon_social: "HSE Ingeniería S.A.S.",
      nit:          "900.437.268-8",
      tipo_isp:     "ISP_TV",
      rep_legal:    "Isabel Mercedes C. Descance",
      email:        "demo@gesco.co",
      rol:          "empresa",
      municipio:    "Amagá, Antioquia",
    },
  },
  {
    email:    "admin@gesco.co",
    password: "Admin2026*",
    token:    "admin-token-local",
    empresa: {
      id:           "admin-001",
      razon_social: "Gesco",
      nit:          "000.000.000-0",
      tipo_isp:     null,
      rep_legal:    "Equipo Gesco",
      email:        "admin@gesco.co",
      rol:          "admin",
      municipio:    "Medellín, Antioquia",
    },
  },
];



// ── Interceptor response — normaliza errores + mock demo ──────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const config = err.config ?? {};
    const body   = JSON.parse(config.data ?? "{}");

    // Mock login — buscar en todos los usuarios mock
    if (config.url?.includes("/auth/login")) {
      const usuario = USUARIOS_MOCK.find(
        (u) => u.email === body.email && u.password === body.password
      );
      if (usuario) {
        return Promise.resolve({
          data: { token: usuario.token, empresa: usuario.empresa },
        });
      }
    }

    const res    = err.response ?? {};
    const data   = res.data    ?? {};
    const status = res.status  ?? 0;

    return Promise.reject({
      mensaje: data.mensaje ?? data.message ?? "Error de conexión.",
      status,
      campos:  data.campos  ?? [],
      data,
    });
  }
);
