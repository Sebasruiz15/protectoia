// archivo: src/components/layout/Topbar.jsx
import { useTema } from "@/context/ThemeContext";

const IconBell = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconSol = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const IconLuna = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ETIQUETA_ISP = {
  ISP_RESIDENCIAL: "Internet Residencial",
  ISP_EMPRESARIAL: "Internet Empresarial",
  ISP_MIXTO:       "Internet Mixto",
  ISP_TV:          "Internet + TV",
  ISP_TV_MIXTO:    "Internet Mixto + TV",
};

export function Topbar({ empresa }) {
  const { tema, toggleTema } = useTema();

  const isDark = tema === "dark";

  const iniciales = (empresa?.razon_social ?? "?")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const tipoLabel = ETIQUETA_ISP[empresa?.tipo_isp] ?? "—";

  const btnStyle = {
    width:          "36px",
    height:         "36px",
    borderRadius:   "10px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    border:         `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    color:          "var(--text-secondary)",
    cursor:         "pointer",
    transition:     "all 0.2s",
    flexShrink:     0,
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background:   "var(--bg-topbar)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
      }}
    >
      {/* Lado izquierdo */}
      <div className="flex items-center gap-2">
        <span style={{
          fontSize:   "10px",
          padding:    "3px 10px",
          borderRadius: "20px",
          fontWeight: "500",
          background: "var(--accent-soft)",
          border:     `1px solid var(--accent-border)`,
          color:      isDark ? "#93c5fd" : "#185FA5",
        }}>
          {tipoLabel}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          · {empresa?.municipio ?? "Colombia"}
        </span>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-2">

        {/* Botón toggle tema */}
        <button
          onClick={toggleTema}
          style={btnStyle}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
            e.currentTarget.style.color      = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
            e.currentTarget.style.color      = "var(--text-secondary)";
          }}
        >
          {isDark ? <IconSol /> : <IconLuna />}
        </button>

        {/* Notificaciones */}
        <button
          style={{ ...btnStyle, position: "relative" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
            e.currentTarget.style.color      = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
            e.currentTarget.style.color      = "var(--text-secondary)";
          }}
        >
          <IconBell />
          <span style={{
            position:     "absolute",
            top:          "8px",
            right:        "8px",
            width:        "6px",
            height:       "6px",
            borderRadius: "50%",
            background:   "#3888D3",
          }} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div style={{
            width:          "36px",
            height:         "36px",
            borderRadius:   "10px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       "12px",
            fontWeight:     "700",
            color:          "white",
            background:     "#185FA5",
            flexShrink:     0,
          }}>
            {iniciales}
          </div>
          <div className="hidden sm:block">
            <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {empresa?.razon_social ?? "—"}
            </p>
            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
              {empresa?.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}