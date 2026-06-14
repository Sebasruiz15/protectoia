// archivo: src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";

// ── Validación ───────────────────────────────────────────────────
const schema = z.object({
  email:    z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// ── Íconos SVG inline ────────────────────────────────────────────
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const IconEyeOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const IconEyeClosed = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
  </svg>
);
const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
);

// ── Campo reutilizable ───────────────────────────────────────────
function Campo({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-500">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Datos estáticos del panel izquierdo ──────────────────────────
const FEATURES = [
  {
    titulo: "Automatización regulatoria con IA",
    desc:   "Genera tus reportes HECAA, T1.2 y Formato 7 automáticamente desde tus datos operativos.",
  },
  {
    titulo: "Alertas inteligentes de cumplimiento",
    desc:   "Notificaciones por WhatsApp y correo antes de cada vencimiento ante MinTIC y CRC.",
  },
  {
    titulo: "Análisis de documentos en segundos",
    desc:   "Sube facturas, pólizas o contratos y la IA extrae, cruza y valida la información.",
  },
];

const STATS = [
  { valor: "+20",  label: "Empresas asesoradas" },
  { valor: "31",   label: "Actividades automatizadas" },
  { valor: "100%", label: "Cobertura normativa" },
];

// ── Página Login ─────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const [cargando,    setCargando]    = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [verPassword, setVerPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setCargando(true);
    setErrorGlobal("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token",   data.token);
      localStorage.setItem("empresa", JSON.stringify(data.empresa));
      navigate(data.empresa.rol === "admin" ? "/admin" : "/portal", { replace: true });
    } catch (err) {
      if (err.status === 403) {
        navigate("/registro", { state: { empresa_id: err.data?.empresa_id, email } });
        return;
      }
      setErrorGlobal(err.mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — solo visible en lg+ ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between
                      bg-gradient-to-br from-brand-600 via-brand-700 to-[#021018]
                      px-14 py-12 relative overflow-hidden">

        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
          aria-hidden="true" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <IconBolt />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">IA System Group</p>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest">Compliance TIC · Colombia</p>
          </div>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug max-w-sm">
              Cumplimiento regulatorio<br/>
              <span className="text-blue-300">automatizado con IA</span>
            </h2>
            <p className="mt-3 text-sm text-blue-100/80 leading-relaxed max-w-xs">
              La única plataforma que gestiona tus obligaciones ante MinTIC, CRC
              y SIC sin consultoras externas.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map((f) => (
              <li key={f.titulo} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-400/20 border border-blue-400/30
                                flex items-center justify-center text-blue-300 flex-shrink-0 mt-0.5">
                  <IconCheck />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.titulo}</p>
                  <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.valor}</p>
                <p className="text-xs text-blue-200/70 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-blue-200/40 relative z-10">
          © {new Date().getFullYear()} IA System Group · Colombia
        </p>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm space-y-6">

          {/* Logo solo en móvil */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <IconBolt />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">IA System Group</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Compliance TIC · Colombia</p>
            </div>
          </div>

          {/* Título */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">Bienvenido de vuelta</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para continuar.</p>
          </div>

          {/* Card formulario */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">

              {errorGlobal && (
                <div role="alert"
                  className="flex items-start gap-2.5 bg-red-50 border border-red-200
                             text-red-700 text-xs rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errorGlobal}
                </div>
              )}

              <Campo label="Correo institucional" error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="contacto@empresa.co"
                  autoComplete="email"
                  className={`input-field ${errors.email ? "input-error" : ""}`}
                />
              </Campo>

              <Campo label="Contraseña" error={errors.password?.message}>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={verPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={verPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {verPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                  </button>
                </div>
              </Campo>

              <div className="flex justify-end -mt-1">
                <Link to="/recuperar-password"
                  className="text-xs text-brand-600 hover:text-brand-700 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" disabled={cargando} className="btn-primary">
                {cargando
                  ? <><IconSpinner /> Ingresando…</>
                  : "Ingresar a la plataforma"
                }
              </button>

            </form>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="text-brand-600 font-semibold hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          {/* Sellos de seguridad */}
          <div className="flex items-center justify-center gap-5">
            {["TLS 1.3", "Datos seguros", "ISO 27001"].map((s) => (
              <span key={s} className="flex items-center gap-1 text-[10px] text-slate-400">
                <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                {s}
              </span>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}