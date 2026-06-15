// archivo: src/components/layout/Topbar.jsx

const IconBell = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Mapa de etiquetas para el tipo ISP
const ETIQUETA_ISP = {
  ISP_RESIDENCIAL: "Internet Residencial",
  ISP_EMPRESARIAL: "Internet Empresarial",
  ISP_MIXTO:       "Internet Mixto",
  ISP_TV:          "Internet + TV",
  ISP_TV_MIXTO:    "Internet Mixto + TV",
};

export function Topbar({ empresa }) {
  const iniciales = (empresa?.razon_social ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const tipoLabel = ETIQUETA_ISP[empresa?.tipo_isp] ?? "—";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background:   "#021018",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Lado izquierdo — tipo de operador */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
          style={{
            background: "rgba(24,95,165,0.2)",
            border:     "1px solid rgba(56,136,211,0.3)",
            color:      "#93c5fd",
          }}
        >
          {tipoLabel}
        </span>
        <span className="text-xs" style={{ color: "rgba(147,197,253,0.35)" }}>
          · {empresa?.municipio ?? "Colombia"}
        </span>
      </div>

      {/* Lado derecho — notificaciones + avatar */}
      <div className="flex items-center gap-3">

        {/* Notificaciones */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border:     "1px solid rgba(255,255,255,0.08)",
            color:      "rgba(147,197,253,0.5)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color      = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color      = "rgba(147,197,253,0.5)";
          }}
        >
          <IconBell />
          {/* Punto de notificación */}
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "#3888D3" }}
          />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "#185FA5" }}
          >
            {iniciales}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white leading-tight truncate max-w-[140px]">
              {empresa?.razon_social ?? "—"}
            </p>
            <p className="text-[10px]" style={{ color: "rgba(147,197,253,0.45)" }}>
              {empresa?.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}