// archivo: src/components/auth/VerificacionOTP.jsx
import { useState, useRef, useEffect } from "react";
import { api } from "@/services/api";

const LONGITUD      = 6;
const REENVIO_ESPERA = 60;

export function VerificacionOTP({ empresaId, email, onExito }) {
  const [digitos,  setDigitos]  = useState(Array(LONGITUD).fill(""));
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState("");
  const [enviando, setEnviando] = useState(false);
  const [segundos, setSegundos] = useState(REENVIO_ESPERA);
  const [exitoso,  setExitoso]  = useState(false);
  const refs = useRef([]);

  // Cuenta regresiva reenvío
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  // Auto-foco al montar
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i, valor) => {
    if (!/^\d?$/.test(valor)) return;
    const nuevo = [...digitos];
    nuevo[i] = valor;
    setDigitos(nuevo);
    setError("");
    if (valor && i < LONGITUD - 1) refs.current[i + 1]?.focus();
    if (nuevo.every((d) => d !== "") && valor) verificar(nuevo.join(""));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digitos[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pegado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LONGITUD);
    if (!pegado) return;
    const nuevo = Array(LONGITUD).fill("");
    pegado.split("").forEach((c, i) => { nuevo[i] = c; });
    setDigitos(nuevo);
    refs.current[Math.min(pegado.length, LONGITUD - 1)]?.focus();
    if (pegado.length === LONGITUD) verificar(pegado);
  };

  const verificar = async (codigo) => {
    setCargando(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verificar", {
        empresa_id: empresaId,
        codigo,
      });
      setExitoso(true);
      setTimeout(() => onExito(data), 1200);
    } catch (err) {
      setError(err.mensaje ?? "Código incorrecto. Intenta de nuevo.");
      setDigitos(Array(LONGITUD).fill(""));
      refs.current[0]?.focus();
    } finally {
      setCargando(false);
    }
  };

  const reenviar = async () => {
    if (segundos > 0) return;
    setEnviando(true);
    setError("");
    try {
      await api.post("/auth/reenviar-codigo", { empresa_id: empresaId });
      setSegundos(REENVIO_ESPERA);
      setDigitos(Array(LONGITUD).fill(""));
      refs.current[0]?.focus();
    } catch (err) {
      setError(err.mensaje ?? "No se pudo reenviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const emailOculto = email.replace(/(.{2}).+(@.+)/, "$1•••$2");

  // ── Pantalla de éxito ─────────────────────────────────────────
  if (exitoso) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(15,110,86,0.2)", border: "1px solid rgba(52,211,153,0.3)" }}
        >
          <svg className="w-8 h-8" fill="none" stroke="#34d399" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">¡Cuenta verificada!</p>
          <p className="text-sm mt-1" style={{ color: "rgba(147,197,253,0.55)" }}>
            Redirigiendo al portal…
          </p>
        </div>
      </div>
    );
  }

  // ── Pantalla OTP ──────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6">

      {/* Ícono correo */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(24,95,165,0.2)",
          border:     "1px solid rgba(56,136,211,0.3)",
        }}
      >
        <svg className="w-7 h-7" fill="none" stroke="#5EA1DD" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Info correo */}
      <div className="text-center">
        <p className="text-sm" style={{ color: "rgba(147,197,253,0.6)" }}>
          Enviamos un código de 6 dígitos a
        </p>
        <p className="text-sm font-semibold text-white mt-0.5">{emailOculto}</p>
      </div>

      {/* Inputs OTP */}
      <div className="flex gap-3" onPaste={handlePaste}>
        {digitos.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={cargando}
            className="text-center text-xl font-bold rounded-xl outline-none transition-all duration-150"
            style={{
              width:      "48px",
              height:     "56px",
              fontSize:   "20px",
              background: error
                ? "rgba(248,113,113,0.1)"
                : d
                ? "rgba(24,95,165,0.2)"
                : "rgba(255,255,255,0.05)",
              border: error
                ? "2px solid rgba(248,113,113,0.6)"
                : d
                ? "2px solid rgba(56,136,211,0.6)"
                : "2px solid rgba(255,255,255,0.1)",
              color: error ? "#fca5a5" : "white",
              opacity: cargando ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="w-full rounded-xl px-4 py-3 text-sm text-center"
          style={{
            background: "rgba(248,113,113,0.1)",
            border:     "1px solid rgba(248,113,113,0.3)",
            color:      "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Spinner verificando */}
      {cargando && (
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "rgba(147,197,253,0.6)" }}
        >
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Verificando…
        </div>
      )}

      {/* Reenvío */}
      <div className="text-sm text-center" style={{ color: "rgba(147,197,253,0.5)" }}>
        ¿No recibiste el correo?{" "}
        {segundos > 0 ? (
          <span style={{ color: "rgba(147,197,253,0.4)" }}>
            Reenviar en{" "}
            <span
              className="font-semibold tabular-nums"
              style={{ color: "rgba(147,197,253,0.8)" }}
            >
              {segundos}s
            </span>
          </span>
        ) : (
          <button
            onClick={reenviar}
            disabled={enviando}
            className="font-semibold transition-colors disabled:opacity-60"
            style={{ color: "#5EA1DD" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5EA1DD")}
          >
            {enviando ? "Enviando…" : "Reenviar código"}
          </button>
        )}
      </div>
    </div>
  );
}