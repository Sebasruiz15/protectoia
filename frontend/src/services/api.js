// archivo: src/services/api.js
import axios from "axios";

// ── Cliente HTTP ──────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  timeout: 10_000,
});

// ── Interceptor request — adjunta token ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Usuario demo (mock local) ─────────────────────────────────────
const DEMO = {
  email:    "demo@iasystemgroup.co",
  password: "Demo2026*",
  token:    "demo-token-local",
  empresa: {
    id:          "demo-001",
    razon_social: "HSE Ingeniería S.A.S.",
    nit:          "900.437.268-8",
    tipo_isp:     "ISP_TV",
    rep_legal:    "Isabel Mercedes C. Descance",
    email:        "demo@iasystemgroup.co",
    rol:          "empresa",
    municipio:    "Amagá, Antioquia",
  },
};

// ── Interceptor response — normaliza errores + mock demo ──────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Si no hay respuesta del servidor, revisamos si es el demo
    const config = err.config ?? {};
    const body   = JSON.parse(config.data ?? "{}");

    // Mock login demo
    if (
      config.url?.includes("/auth/login") &&
      body.email    === DEMO.email &&
      body.password === DEMO.password
    ) {
      return Promise.resolve({
        data: { token: DEMO.token, empresa: DEMO.empresa },
      });
    }

    const res     = err.response ?? {};
    const data    = res.data    ?? {};
    const status  = res.status  ?? 0;

    return Promise.reject({
      mensaje: data.mensaje ?? data.message ?? "Error de conexión.",
      status,
      campos:  data.campos  ?? [],
      data,
    });
  }
);