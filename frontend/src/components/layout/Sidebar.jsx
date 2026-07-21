// archivo: src/components/layout/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTema } from "@/context/ThemeContext";

// ── Íconos ────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconReportes = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconCalendario = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconEmpresa = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
    className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// ── Reportes por tipo ISP ─────────────────────────────────────────
const REPORTES_POR_ISP = {
  ISP_RESIDENCIAL: [{ label: "Formato T.1.2", path: "reportes/t12", badge: "CRC"    }],
  ISP_EMPRESARIAL: [{ label: "Formato T.1.1", path: "reportes/t11", badge: "CRC"    }],
  ISP_MIXTO:       [{ label: "Formato T.1.2", path: "reportes/t12", badge: "CRC"    },
                    { label: "Formato T.1.1", path: "reportes/t11", badge: "CRC"    }],
  ISP_TV:          [{ label: "Formato T.1.2", path: "reportes/t12", badge: "CRC"    },
                    { label: "Formato 7",     path: "reportes/f7",  badge: "MinTIC" }],
  ISP_TV_MIXTO:    [{ label: "Formato T.1.2", path: "reportes/t12", badge: "CRC"    },
                    { label: "Formato T.1.1", path: "reportes/t11", badge: "CRC"    },
                    { label: "Formato 7",     path: "reportes/f7",  badge: "MinTIC" }],
};

export function Sidebar({ empresa }) {
  const navigate             = useNavigate();
  const { tema }             = useTema();
  const [reportesOpen, setReportesOpen] = useState(true);

  const isDark   = tema === "dark";
  const reportes = REPORTES_POR_ISP[empresa?.tipo_isp] ?? REPORTES_POR_ISP.ISP_RESIDENCIAL;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresa");
    navigate("/login", { replace: true });
  };

  // Colores adaptativos
  const textMuted    = isDark ? "rgba(147,197,253,0.6)"  : "rgba(255,255,255,0.6)";
  const textSubtle   = isDark ? "rgba(147,197,253,0.45)" : "rgba(255,255,255,0.45)";
  const borderColor  = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)";
  const activeBg     = isDark ? "rgba(24,95,165,0.25)"   : "rgba(255,255,255,0.15)";
  const activeBorder = isDark ? "rgba(56,136,211,0.3)"   : "rgba(255,255,255,0.3)";
  const hoverBg      = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)";

  const linkStyle = (isActive) => ({
    display:        "flex",
    alignItems:     "center",
    gap:            "10px",
    padding:        "9px 12px",
    borderRadius:   "10px",
    fontSize:       "13px",
    fontWeight:     "500",
    textDecoration: "none",
    transition:     "all 0.15s",
    color:          isActive ? "white" : textMuted,
    background:     isActive ? activeBg : "transparent",
    border:         isActive ? `1px solid ${activeBorder}` : "1px solid transparent",
  });

  return (
    <aside style={{
      display:      "flex",
      flexDirection:"column",
      height:       "100vh",
      width:        "240px",
      flexShrink:   0,
      background:   "var(--bg-sidebar)",
      borderRight:  `1px solid ${borderColor}`,
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 16px", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.1)",
          border:     "1px solid rgba(255,255,255,0.15)",
          color:      "white", flexShrink: 0,
        }}>
          <IconBolt />
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "white", lineHeight: 1.2 }}>
            Gesco IA
          </p>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>
            Compliance TIC
          </p>
        </div>
      </div>

      {/* Empresa activa */}
      <div style={{
        margin: "10px 10px 4px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: isDark ? "rgba(24,95,165,0.15)" : "rgba(255,255,255,0.1)",
        border:     isDark ? "1px solid rgba(56,136,211,0.2)" : "1px solid rgba(255,255,255,0.15)",
      }}>
        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: textSubtle, marginBottom: "3px" }}>
          Empresa activa
        </p>
        <p style={{ fontSize: "12px", fontWeight: "500", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {empresa?.razon_social ?? "—"}
        </p>
        <p style={{ fontSize: "10px", color: textSubtle, marginTop: "1px" }}>
          NIT {empresa?.nit ?? "—"}
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>

        {/* Dashboard */}
        <NavLink to="/portal" end style={({ isActive }) => linkStyle(isActive)}>
          <IconDashboard />
          Dashboard
        </NavLink>

        {/* Mis reportes */}
        <div>
          <button
            onClick={() => setReportesOpen((v) => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "9px 12px",
              borderRadius: "10px", border: "1px solid transparent",
              background: "transparent", color: textMuted,
              fontSize: "13px", fontWeight: "500", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconReportes /> Mis reportes
            </span>
            <IconChevron open={reportesOpen} />
          </button>

          {reportesOpen && (
            <div style={{ marginLeft: "14px", paddingLeft: "12px", borderLeft: `1px solid ${borderColor}`, marginTop: "2px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {reportes.map((r) => (
                <NavLink
                  key={r.path}
                  to={`/portal/${r.path}`}
                  style={({ isActive }) => ({
                    ...linkStyle(isActive),
                    fontSize: "12px",
                    padding:  "7px 10px",
                  })}
                >
                  <span style={{ flex: 1 }}>{r.label}</span>
                  <span style={{
                    fontSize: "9px", padding: "2px 6px", borderRadius: "20px",
                    background: isDark ? "rgba(56,136,211,0.15)" : "rgba(255,255,255,0.15)",
                    color: isDark ? "#93c5fd" : "rgba(255,255,255,0.8)",
                    border: isDark ? "1px solid rgba(56,136,211,0.25)" : "1px solid rgba(255,255,255,0.2)",
                  }}>
                    {r.badge}
                  </span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Calendario */}
        <NavLink to="/portal/calendario" style={({ isActive }) => linkStyle(isActive)}>
          <IconCalendario /> Calendario
        </NavLink>

        {/* Mi empresa */}
        <NavLink to="/portal/empresa" style={({ isActive }) => linkStyle(isActive)}>
          <IconEmpresa /> Mi empresa
        </NavLink>
      </nav>

      {/* Cerrar sesión */}
      <div style={{ padding: "10px", borderTop: `1px solid ${borderColor}` }}>
        <button
          onClick={cerrarSesion}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 12px", borderRadius: "10px", border: "1px solid transparent",
            background: "transparent", color: "rgba(248,113,113,0.6)",
            fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.08)";
            e.currentTarget.style.color      = "rgba(248,113,113,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "rgba(248,113,113,0.6)";
          }}
        >
          <IconLogout /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}