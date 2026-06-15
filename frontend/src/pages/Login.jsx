// archivo: src/pages/Login.jsx
import { useState, useEffect, useRef } from "react";
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

// ── Íconos ───────────────────────────────────────────────────────
const IconBolt = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const IconEyeOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconEyeClosed = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);
const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd" />
  </svg>
);

// ── Canvas — Red de nodos ─────────────────────────────────────────
function RedNodos({ canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DIST    = 120;
    const TOTAL   = 55;
    const paquetes = [];

    const nodos = Array.from({ length: TOTAL }, (_, i) => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 1.8 + 0.8,
      pulso: Math.random() * Math.PI * 2,
      // Hub principal más grande y blanco
      color: i === 0 ? "#ffffff" : Math.random() > 0.65 ? "#5EA1DD" : "#3888D3",
      size:  i === 0 ? 4 : Math.random() * 1.8 + 0.8,
    }));

    // Hub fijo al centro izquierdo
    nodos[0].x = canvas.width * 0.25;
    nodos[0].y = canvas.height * 0.5;
    nodos[0].vx = 0.08;
    nodos[0].vy = 0.06;

    let frame = 0;
    let raf;

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mover nodos
      nodos.forEach((n) => {
        n.x    += n.vx;
        n.y    += n.vy;
        n.pulso += 0.025;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Líneas
      for (let i = 0; i < nodos.length; i++) {
        for (let j = i + 1; j < nodos.length; j++) {
          const dx = nodos[i].x - nodos[j].x;
          const dy = nodos[i].y - nodos[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            ctx.beginPath();
            ctx.moveTo(nodos[i].x, nodos[i].y);
            ctx.lineTo(nodos[j].x, nodos[j].y);
            ctx.strokeStyle = `rgba(56,136,211,${(1 - d / DIST) * 0.22})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      // Lanzar paquete de datos cada 50 frames
      if (frame % 50 === 0) {
        const i = Math.floor(Math.random() * nodos.length);
        const j = Math.floor(Math.random() * nodos.length);
        if (i !== j) {
          paquetes.push({
            ax: nodos[i].x, ay: nodos[i].y,
            bx: nodos[j].x, by: nodos[j].y,
            t: 0,
          });
        }
      }

      // Dibujar y avanzar paquetes
      for (let k = paquetes.length - 1; k >= 0; k--) {
        const p = paquetes[k];
        p.t += 0.016;
        const x = p.ax + (p.bx - p.ax) * p.t;
        const y = p.ay + (p.by - p.ay) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(147,197,253,0.9)";
        ctx.fill();
        if (p.t >= 1) paquetes.splice(k, 1);
      }

      // Nodos
      nodos.forEach((n) => {
        const glow = Math.sin(n.pulso) * 0.5 + 0.5;
        // Halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size + 2 + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,136,211,${0.05 + glow * 0.07})`;
        ctx.fill();
        // Punto
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);

  return null;
}

// ── Datos estáticos ───────────────────────────────────────────────
const FEATURES = [
  {
    titulo: "Automatización regulatoria con IA",
    desc:   "Genera reportes HECAA, T.1.2 y Formato 7 automáticamente.",
  },
  {
    titulo: "Alertas inteligentes de cumplimiento",
    desc:   "Notificaciones antes de cada vencimiento ante MinTIC y CRC.",
  },
  {
    titulo: "Análisis de documentos en segundos",
    desc:   "Sube facturas, pólizas o contratos y la IA extrae y valida.",
  },
];

const STATS = [
  { valor: "+20",  label: "Empresas asesoradas" },
  { valor: "31",   label: "Actividades automatizadas" },
  { valor: "100%", label: "Cobertura normativa" },
];

const SELLOS = ["TLS 1.3", "Datos seguros", "ISO 27001"];

// ── Campo de formulario ───────────────────────────────────────────
function Campo({ label, error, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold tracking-widest"
        style={{ color: "rgba(147,197,253,0.7)" }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 flex items-center"
            style={{ color: "rgba(147,197,253,0.4)" }}>
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Página Login ──────────────────────────────────────────────────
export function Login() {
  const navigate    = useNavigate();
  const canvasRef   = useRef(null);
  const [cargando,    setCargando]    = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [pingActivo,  setPingActivo]  = useState(true);

  // Ping badge parpadea cada 900 ms
  useEffect(() => {
    const t = setInterval(() => setPingActivo((v) => !v), 900);
    return () => clearInterval(t);
  }, []);

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
      setErrorGlobal(err.mensaje ?? "Error de conexión. Verifica tu internet.");
    } finally {
      setCargando(false);
    }
  };

  // Estilos inline reutilizables para inputs oscuros
  const inputBase = {
    background:  "rgba(255,255,255,0.05)",
    border:      "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color:       "white",
    fontSize:    "13px",
    padding:     "10px 14px 10px 40px",
    width:       "100%",
    outline:     "none",
    transition:  "border-color 0.2s",
  };
  const inputError = {
    ...inputBase,
    border: "1px solid rgba(248,113,113,0.6)",
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "#021018" }}
    >
      {/* ── Canvas fondo — panel izquierdo ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <RedNodos canvasRef={canvasRef} />

      {/* Overlay degradado para separar visualmente los dos paneles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(2,16,24,0) 45%, rgba(2,16,24,0.92) 55%, rgba(2,16,24,1) 100%)",
          zIndex: 1,
        }}
      />

      {/* ══════════════════════════════════════════
          PANEL IZQUIERDO — visible solo en lg+
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between px-14 py-12 relative"
        style={{ zIndex: 2 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.08)",
              border:     "1px solid rgba(255,255,255,0.15)",
              color:      "white",
            }}
          >
            <IconBolt />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              IA System Group
            </p>
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "rgba(147,197,253,0.7)" }}
            >
              Compliance TIC · Colombia
            </p>
          </div>
        </div>

        {/* Contenido central */}
        <div className="flex flex-col gap-8">

          {/* Badge ping */}
          <div
            className="inline-flex items-center gap-2 w-fit rounded-full px-3 py-1.5"
            style={{
              background: "rgba(24,95,165,0.25)",
              border:     "1px solid rgba(56,136,211,0.4)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full block transition-opacity duration-300"
              style={{
                background: "#3888D3",
                opacity:    pingActivo ? 1 : 0.25,
              }}
            />
            <span
              className="text-[10px] tracking-widest font-medium"
              style={{ color: "#93c5fd" }}
            >
              RED ACTIVA · 1,247 NODOS CONECTADOS
            </span>
          </div>

          {/* Titular */}
          <div>
            <h2 className="text-[28px] font-semibold text-white leading-snug">
              Cumplimiento regulatorio<br />
              <span style={{ color: "#5EA1DD" }}>automatizado con IA</span>
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed max-w-xs"
              style={{ color: "rgba(147,197,253,0.65)" }}
            >
              La única plataforma que gestiona tus obligaciones ante MinTIC,
              CRC y SIC sin consultoras externas.
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f.titulo} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(56,136,211,0.15)",
                    border:     "1px solid rgba(56,136,211,0.35)",
                    color:      "#5EA1DD",
                  }}
                >
                  <IconCheck />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.titulo}</p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "rgba(147,197,253,0.6)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold text-white">{s.valor}</p>
                <p
                  className="text-[10px] mt-1 leading-tight"
                  style={{ color: "rgba(147,197,253,0.5)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-[10px]"
          style={{ color: "rgba(147,197,253,0.25)" }}
        >
          © {new Date().getFullYear()} IA System Group · Colombia
        </p>
      </div>

      {/* Línea divisora con pulso */}
      <div
        className="hidden lg:block w-px flex-shrink-0 relative"
        style={{ background: "rgba(255,255,255,0.06)", zIndex: 2 }}
      >
        <PulseLine />
      </div>

      {/* ══════════════════════════════════════════
          PANEL DERECHO — formulario
      ══════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ zIndex: 2 }}
      >
        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Logo solo en móvil */}
          <div className="flex items-center gap-3 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.08)",
                border:     "1px solid rgba(255,255,255,0.15)",
                color:      "white",
              }}
            >
              <IconBolt />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">IA System Group</p>
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(147,197,253,0.6)" }}
              >
                Compliance TIC · Colombia
              </p>
            </div>
          </div>

          {/* Título */}
          <div>
            <h1 className="text-xl font-semibold text-white">
              Bienvenido de vuelta
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(147,197,253,0.55)" }}
            >
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Card formulario glass */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="p-6 flex flex-col gap-4"
            >
              {/* Error global */}
              {errorGlobal && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border:     "1px solid rgba(248,113,113,0.3)",
                    color:      "#fca5a5",
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd" />
                  </svg>
                  {errorGlobal}
                </div>
              )}

              {/* Email */}
              <Campo
                label="CORREO INSTITUCIONAL"
                error={errors.email?.message}
                icon={<IconMail />}
              >
                <input
                  {...register("email")}
                  type="email"
                  placeholder="contacto@empresa.co"
                  autoComplete="email"
                  style={errors.email ? inputError : inputBase}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.email
                      ? "rgba(248,113,113,0.8)"
                      : "rgba(56,136,211,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email
                      ? "rgba(248,113,113,0.6)"
                      : "rgba(255,255,255,0.1)";
                  }}
                />
              </Campo>

              {/* Password */}
              <Campo
                label="CONTRASEÑA"
                error={errors.password?.message}
                icon={<IconLock />}
              >
                <input
                  {...register("password")}
                  type={verPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  style={{
                    ...(errors.password ? inputError : inputBase),
                    paddingRight: "44px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.password
                      ? "rgba(248,113,113,0.8)"
                      : "rgba(56,136,211,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password
                      ? "rgba(248,113,113,0.6)"
                      : "rgba(255,255,255,0.1)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute right-3 transition-colors"
                  style={{ color: "rgba(147,197,253,0.4)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(147,197,253,0.9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(147,197,253,0.4)")}
                >
                  {verPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              </Campo>

              {/* Olvidé contraseña */}
              <div className="flex justify-end -mt-1">
                <Link
                  to="/recuperar-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: "#5EA1DD" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5EA1DD")}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#185FA5" }}
                onMouseEnter={(e) => {
                  if (!cargando) e.currentTarget.style.background = "#0C447C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#185FA5";
                }}
              >
                {cargando ? (
                  <><IconSpinner /> Ingresando…</>
                ) : (
                  <>Ingresar a la plataforma <IconArrow /></>
                )}
              </button>
            </form>

            {/* Pie del card */}
            <div
              className="px-6 py-4 text-center text-xs"
              style={{
                background:  "rgba(255,255,255,0.02)",
                borderTop:   "1px solid rgba(255,255,255,0.06)",
                color:       "rgba(147,197,253,0.45)",
              }}
            >
              ¿No tienes cuenta?{" "}
              <Link
                to="/registro"
                className="font-semibold transition-colors"
                style={{ color: "#5EA1DD" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5EA1DD")}
              >
                Regístrate aquí
              </Link>
            </div>
          </div>

          {/* Sellos de seguridad */}
          <div className="flex items-center justify-center gap-5">
            {SELLOS.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-[10px]"
                style={{ color: "rgba(147,197,253,0.3)" }}
              >
                <IconShield />
                {s}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Línea divisora con pulso animado ─────────────────────────────
function PulseLine() {
  const [top, setTop] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setTop((prev) => {
        const next = prev + dir * 3;
        if (next > 500) setDir(-1);
        if (next < 0)   setDir(1);
        return next;
      });
    }, 20);
    return () => clearInterval(t);
  }, [dir]);

  return (
    <div
      className="absolute w-px"
      style={{
        top:        `${top}px`,
        left:       0,
        height:     "80px",
        background: "linear-gradient(to bottom, transparent, #3888D3, transparent)",
        transition: "top 20ms linear",
      }}
    />
  );
}