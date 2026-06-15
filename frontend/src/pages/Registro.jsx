// archivo: src/pages/Registro.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegistroForm }    from "@/components/auth/RegistroForm";
import { VerificacionOTP } from "@/components/auth/VerificacionOTP";

const PASOS = {
  REGISTRO:     "registro",
  VERIFICACION: "verificacion",
};

const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
      d="M5 13l4 4L19 7" />
  </svg>
);

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

    const DIST     = 120;
    const paquetes = [];

    const nodos = Array.from({ length: 55 }, (_, i) => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      pulso: Math.random() * Math.PI * 2,
      color: i === 0 ? "#ffffff" : Math.random() > 0.65 ? "#5EA1DD" : "#3888D3",
      size:  i === 0 ? 4 : Math.random() * 1.8 + 0.8,
    }));

    nodos[0].x  = canvas.width * 0.25;
    nodos[0].y  = canvas.height * 0.5;
    nodos[0].vx = 0.08;
    nodos[0].vy = 0.06;

    let frame = 0;
    let raf;

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodos.forEach((n) => {
        n.x     += n.vx;
        n.y     += n.vy;
        n.pulso += 0.025;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

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

      if (frame % 50 === 0) {
        const i = Math.floor(Math.random() * nodos.length);
        const j = Math.floor(Math.random() * nodos.length);
        if (i !== j) paquetes.push({
          ax: nodos[i].x, ay: nodos[i].y,
          bx: nodos[j].x, by: nodos[j].y,
          t:  0,
        });
      }

      for (let k = paquetes.length - 1; k >= 0; k--) {
        const p = paquetes[k];
        p.t += 0.016;
        ctx.beginPath();
        ctx.arc(
          p.ax + (p.bx - p.ax) * p.t,
          p.ay + (p.by - p.ay) * p.t,
          2, 0, Math.PI * 2
        );
        ctx.fillStyle = "rgba(147,197,253,0.9)";
        ctx.fill();
        if (p.t >= 1) paquetes.splice(k, 1);
      }

      nodos.forEach((n) => {
        const glow = Math.sin(n.pulso) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size + 2 + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,136,211,${0.05 + glow * 0.07})`;
        ctx.fill();
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

function PulseLine() {
  const dirRef = useRef(1);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTop((prev) => {
        const next = prev + dirRef.current * 3;
        if (next > 500) dirRef.current = -1;
        if (next < 0)   dirRef.current =  1;
        return next;
      });
    }, 20);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="absolute w-px"
      style={{
        top:        `${top}px`,
        left:       0,
        height:     "80px",
        background: "linear-gradient(to bottom, transparent, #3888D3, transparent)",
      }}
    />
  );
}

function IndicadorPasos({ pasoActual }) {
  const pasos = [
    { id: PASOS.REGISTRO,     label: "Datos de la empresa" },
    { id: PASOS.VERIFICACION, label: "Verificar correo"    },
  ];

  return (
    <div className="flex items-center gap-2 w-full">
      {pasos.map((paso, idx) => {
        const completado = pasos.findIndex((p) => p.id === pasoActual) > idx;
        const activo     = pasoActual === paso.id;

        return (
          <div key={paso.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-300"
              style={{
                background: completado ? "#0F6E56" : activo ? "#185FA5" : "rgba(255,255,255,0.08)",
                border: completado
                  ? "1px solid rgba(15,110,86,0.6)"
                  : activo
                  ? "1px solid rgba(24,95,165,0.6)"
                  : "1px solid rgba(255,255,255,0.12)",
                color: completado || activo ? "white" : "rgba(147,197,253,0.4)",
              }}
            >
              {completado ? <IconCheck /> : idx + 1}
            </div>

            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{
                color: completado
                  ? "#34d399"
                  : activo
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(147,197,253,0.35)",
              }}
            >
              {paso.label}
            </span>

            {idx < pasos.length - 1 && (
              <div
                className="flex-1 h-px"
                style={{
                  background: completado
                    ? "rgba(52,211,153,0.5)"
                    : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const PASOS_PROCESO = [
  {
    num:    "01",
    titulo: "Registro en menos de 3 minutos",
    desc:   "Solo necesitas NIT, correo y datos básicos de tu empresa.",
  },
  {
    num:    "02",
    titulo: "Selecciona tus servicios regulados",
    desc:   "Internet, TV o ambos. La plataforma adapta tus obligaciones automáticamente.",
  },
  {
    num:    "03",
    titulo: "Verificación instantánea",
    desc:   "Recibirás un código en tu correo para activar la cuenta de inmediato.",
  },
  {
    num:    "04",
    titulo: "Empieza a cumplir con la IA",
    desc:   "Desde el primer día tienes el calendario regulatorio activo.",
  },
];

export function Registro() {
  const navigate                          = useNavigate();
  const canvasRef                         = useRef(null);
  const [pasoActual,    setPasoActual]    = useState(PASOS.REGISTRO);
  const [datosRegistro, setDatosRegistro] = useState(null);
  const [pingActivo,    setPingActivo]    = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPingActivo((v) => !v), 900);
    return () => clearInterval(t);
  }, []);

  const handleRegistroExitoso = (datos) => {
    setDatosRegistro(datos);
    setPasoActual(PASOS.VERIFICACION);
  };

  const handleVerificacionExitosa = (data) => {
    localStorage.setItem("token",   data.token);
    localStorage.setItem("empresa", JSON.stringify(data.empresa));
    navigate(data.empresa.rol === "admin" ? "/admin" : "/portal", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "#021018" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <RedNodos canvasRef={canvasRef} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(2,16,24,0) 45%, rgba(2,16,24,0.92) 55%, rgba(2,16,24,1) 100%)",
          zIndex: 1,
        }}
      />

      {/* ══ PANEL IZQUIERDO ══════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between px-14 py-12 relative"
        style={{ zIndex: 2 }}
      >
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
            <p className="text-[10px] uppercase tracking-widest"
              style={{ color: "rgba(147,197,253,0.7)" }}>
              Compliance TIC · Colombia
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div
            className="inline-flex items-center gap-2 w-fit rounded-full px-3 py-1.5"
            style={{
              background: "rgba(24,95,165,0.25)",
              border:     "1px solid rgba(56,136,211,0.4)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full block transition-opacity duration-300"
              style={{ background: "#3888D3", opacity: pingActivo ? 1 : 0.25 }}
            />
            <span className="text-[10px] tracking-widest font-medium"
              style={{ color: "#93c5fd" }}>
              REGISTRO ABIERTO · ACTÍVATE HOY
            </span>
          </div>

          <div>
            <h2 className="text-[28px] font-semibold text-white leading-snug">
              Empieza a cumplir<br />
              <span style={{ color: "#5EA1DD" }}>desde el primer día</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed max-w-xs"
              style={{ color: "rgba(147,197,253,0.65)" }}>
              Regístrate gratis y ten tu plataforma de cumplimiento regulatorio
              activa en menos de 3 minutos.
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {PASOS_PROCESO.map((p) => (
              <li key={p.num} className="flex items-start gap-3">
                <span className="text-xs font-bold flex-shrink-0 mt-0.5 w-5"
                  style={{ color: "rgba(94,161,221,0.55)" }}>
                  {p.num}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{p.titulo}</p>
                  <p className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "rgba(147,197,253,0.6)" }}>
                    {p.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="pl-4"
            style={{ borderLeft: "2px solid rgba(94,161,221,0.3)" }}>
            <p className="text-sm italic leading-relaxed"
              style={{ color: "rgba(147,197,253,0.7)" }}>
              "Antes tardábamos 3 días en preparar los reportes HECAA.
              Ahora los tenemos listos en minutos."
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(94,161,221,0.5)" }}>
              — Operador TIC · Antioquia
            </p>
          </div>
        </div>

        <p className="text-[10px]" style={{ color: "rgba(147,197,253,0.25)" }}>
          © {new Date().getFullYear()} IA System Group · Colombia
        </p>
      </div>

      <div
        className="hidden lg:block w-px flex-shrink-0 relative"
        style={{ background: "rgba(255,255,255,0.06)", zIndex: 2 }}
      >
        <PulseLine />
      </div>

      {/* ══ PANEL DERECHO ════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ zIndex: 2 }}
      >
        <div className="w-full max-w-md flex flex-col gap-6">

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
              <p className="text-[10px] uppercase tracking-widest"
                style={{ color: "rgba(147,197,253,0.6)" }}>
                Compliance TIC · Colombia
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-white">
              {pasoActual === PASOS.REGISTRO ? "Crea tu cuenta" : "Verifica tu correo"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(147,197,253,0.55)" }}>
              {pasoActual === PASOS.REGISTRO
                ? "Ingresa los datos de tu empresa para comenzar."
                : "Ingresa el código de 6 dígitos que enviamos a tu correo."}
            </p>
          </div>

          <IndicadorPasos pasoActual={pasoActual} />

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="p-6">
              {pasoActual === PASOS.REGISTRO ? (
                <RegistroForm onExito={handleRegistroExitoso} />
              ) : (
                <VerificacionOTP
                  empresaId={datosRegistro.empresa_id}
                  email={datosRegistro.email}
                  onExito={handleVerificacionExitosa}
                />
              )}
            </div>
          </div>

          <p className="text-center text-xs pt-1"
            style={{ color: "rgba(147,197,253,0.4)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: "#5EA1DD" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#5EA1DD")}
            >
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}