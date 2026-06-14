// archivo: src/pages/Registro.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { VerificacionOTP } from "@/components/auth/VerificacionOTP";

// ─────────────────────────────────────────────────────────────────
// CONCEPTO CLAVE: máquina de estados simple
//
// Este componente tiene solo DOS estados posibles:
//   "registro"     → muestra el formulario de datos de la empresa
//   "verificacion" → muestra la pantalla de OTP (código al correo)
//
// Cuando el formulario termina exitosamente, guarda los datos del
// servidor (empresa_id + email) y cambia al estado "verificacion".
// ─────────────────────────────────────────────────────────────────
const PASOS = {
  REGISTRO: "registro",
  VERIFICACION: "verificacion",
};

// Íconos reutilizables del panel izquierdo
const IconBolt = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const IconCheck = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// Indicador de pasos (barra de progreso visual)
// Recibe el paso actual y pinta el estado de cada etapa.
// ─────────────────────────────────────────────────────────────────
function IndicadorPasos({ pasoActual }) {
  const pasos = [
    { id: PASOS.REGISTRO, label: "Datos de la empresa" },
    { id: PASOS.VERIFICACION, label: "Verificar correo" },
  ];

  return (
    <div className="flex items-center gap-2 w-full">
      {pasos.map((paso, idx) => {
        // Un paso está "completado" si ya pasamos de él
        const completado = pasos.findIndex((p) => p.id === pasoActual) > idx;
        const activo = pasoActual === paso.id;

        return (
          <div
            key={paso.id}
            className="flex items-center gap-2 flex-1 last:flex-none"
          >
            {/* Círculo del paso */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center
                            text-xs font-bold flex-shrink-0 transition-all duration-300
                            ${
                              completado
                                ? "bg-emerald-500 text-white"
                                : activo
                                  ? "bg-brand-600 text-white"
                                  : "bg-slate-200 text-slate-400"
                            }`}
            >
              {/* Si está completado muestra ✓, si no muestra el número */}
              {completado ? <IconCheck /> : idx + 1}
            </div>

            {/* Etiqueta del paso */}
            <span
              className={`text-xs font-medium whitespace-nowrap
                              ${
                                completado
                                  ? "text-emerald-600"
                                  : activo
                                    ? "text-slate-700"
                                    : "text-slate-400"
                              }`}
            >
              {paso.label}
            </span>

            {/* Línea conectora — no va en el último paso */}
            {idx < pasos.length - 1 && (
              <div
                className={`flex-1 h-px transition-colors duration-500
                               ${completado ? "bg-emerald-400" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Datos del panel izquierdo
// Los mismos pasos del proceso que ve el usuario explicados
// como una lista de beneficios — ayuda a reducir la ansiedad
// de llenar el formulario.
// ─────────────────────────────────────────────────────────────────
const PASOS_PROCESO = [
  {
    num: "01",
    titulo: "Registro en menos de 3 minutos",
    desc: "Solo necesitas NIT, correo y datos básicos de tu empresa.",
  },
  {
    num: "02",
    titulo: "Selecciona tus servicios regulados",
    desc: "Internet, TV o ambos. La plataforma adapta tus obligaciones automáticamente.",
  },
  {
    num: "03",
    titulo: "Verificación instantánea",
    desc: "Recibirás un código en tu correo para activar la cuenta de inmediato.",
  },
  {
    num: "04",
    titulo: "Empieza a cumplir con la IA",
    desc: "Desde el primer día tienes el calendario regulatorio y el análisis de documentos activo.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────
export function Registro() {
  const navigate = useNavigate();

  // Estado del flujo: en qué paso estamos
  const [pasoActual, setPasoActual] = useState(PASOS.REGISTRO);

  // Guardamos empresa_id y email que devuelve el backend tras el registro
  // para pasarlos al componente de verificación OTP
  const [datosRegistro, setDatosRegistro] = useState(null);

  // ── Callback: el formulario de registro terminó bien ──────────
  // Recibe { empresa_id, email } que viene del backend
  const handleRegistroExitoso = (datos) => {
    setDatosRegistro(datos);
    setPasoActual(PASOS.VERIFICACION);
  };

  // ── Callback: el OTP fue verificado correctamente ─────────────
  // Recibe { token, empresa } que viene del backend
  const handleVerificacionExitosa = (data) => {
    // Guardamos la sesión en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("empresa", JSON.stringify(data.empresa));

    // Redirigimos según el rol — en registro siempre será "empresa"
    navigate(data.empresa.rol === "admin" ? "/admin" : "/portal", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* ══════════════════════════════════════════
          PANEL IZQUIERDO — solo visible en lg+
          Mismo estilo que el Login para consistencia
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between
                      bg-gradient-to-br from-brand-600 via-brand-700 to-[#021018]
                      px-14 py-12 relative overflow-hidden"
      >
        {/* Patrón decorativo de puntos */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/20
                          flex items-center justify-center text-white"
          >
            <IconBolt />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              IA System Grup
            </p>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest">
              Compliance TIC · Colombia
            </p>
          </div>
        </div>

        {/* Cuerpo central */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug max-w-sm">
              Empieza a cumplir
              <br />
              <span className="text-blue-300">desde el primer día</span>
            </h2>
            <p className="mt-3 text-sm text-blue-100/80 leading-relaxed max-w-xs">
              Regístrate gratis y ten tu plataforma de cumplimiento regulatorio
              activa en menos de 3 minutos.
            </p>
          </div>

          {/* Lista de pasos del proceso */}
          <ul className="space-y-5">
            {PASOS_PROCESO.map((p) => (
              <li key={p.num} className="flex items-start gap-3">
                {/* Número del paso */}
                <span className="text-xs font-bold text-blue-400/60 w-5 flex-shrink-0 mt-0.5">
                  {p.num}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.titulo}</p>
                  <p className="text-xs text-blue-100/70 mt-0.5 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Testimonial simple */}
          <div className="border-l-2 border-blue-400/40 pl-4">
            <p className="text-sm text-blue-100/80 italic leading-relaxed">
              "Antes tardábamos 3 días en preparar los reportes HECAA. Ahora los
              tenemos listos en minutos."
            </p>
            <p className="text-xs text-blue-300/60 mt-2">
              — Operador TIC · Antioquia
            </p>
          </div>
        </div>

        <p className="text-[10px] text-blue-200/40 relative z-10">
          © {new Date().getFullYear()} IA System Grup · Colombia
        </p>
      </div>

      {/* ══════════════════════════════════════════
          PANEL DERECHO — formulario y OTP
      ══════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center
                      bg-slate-50 px-6 py-12"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Logo visible solo en móvil */}
          <div className="flex items-center gap-3 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl bg-brand-600 flex items-center
                            justify-center text-white shadow-sm"
            >
              <IconBolt />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                IA System Grup
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Compliance TIC · Colombia
              </p>
            </div>
          </div>

          {/* Título dinámico según el paso */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {pasoActual === PASOS.REGISTRO
                ? "Crea tu cuenta"
                : "Verifica tu correo"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pasoActual === PASOS.REGISTRO
                ? "Ingresa los datos de tu empresa para comenzar."
                : "Ingresa el código de 6 dígitos que enviamos a tu correo."}
            </p>
          </div>

          {/* Indicador de pasos */}
          <IndicadorPasos pasoActual={pasoActual} />

          {/* ── Contenido del paso activo ── */}
          {pasoActual === PASOS.REGISTRO ? (
            /*
              RegistroForm recibe un callback onExito.
              Cuando el backend responde con 201, el formulario
              llama a este callback con { empresa_id, email }.
            */
            <RegistroForm onExito={handleRegistroExitoso} />
          ) : (
            /*
              VerificacionOTP recibe el empresa_id y email para
              hacer la llamada al endpoint de verificación.
              onExito recibe { token, empresa } del backend.
            */
            <VerificacionOTP
              empresaId={datosRegistro.empresa_id}
              email={datosRegistro.email}
              onExito={handleVerificacionExitosa}
            />
          )}

          {/* Pie — link a login */}
          <p className="text-center text-xs text-slate-500 pt-2">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
