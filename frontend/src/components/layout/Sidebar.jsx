// archivo: src/components/layout/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
  <svg
    className="w-4 h-4 transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 9l-7 7-7-7" />
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

// ── Mapa de reportes según tipo ISP ──────────────────────────────
const REPORTES_POR_ISP = {
  ISP_RESIDENCIAL: [
    { label: "Formato T.1.2",  path: "reportes/t12",  badge: "CRC"   },
  ],
  ISP_EMPRESARIAL: [
    { label: "Formato T.1.1",  path: "reportes/t11",  badge: "CRC"   },
  ],
  ISP_MIXTO: [
    { label: "Formato T.1.2",  path: "reportes/t12",  badge: "CRC"   },
    { label: "Formato T.1.1",  path: "reportes/t11",  badge: "CRC"   },
  ],
  ISP_TV: [
    { label: "Formato T.1.2",  path: "reportes/t12",  badge: "CRC"   },
    { label: "Formato 7",      path: "reportes/f7",   badge: "MinTIC" },
  ],
  ISP_TV_MIXTO: [
    { label: "Formato T.1.2",  path: "reportes/t12",  badge: "CRC"   },
    { label: "Formato T.1.1",  path: "reportes/t11",  badge: "CRC"   },
    { label: "Formato 7",      path: "reportes/f7",   badge: "MinTIC" },
  ],
};

// ── Estilos NavLink activo/inactivo ───────────────────────────────
const linkBase = {
  display:      "flex",
  alignItems:   "center",
  gap:          "10px",
  padding:      "9px 12px",
  borderRadius: "10px",
  fontSize:     "13px",
  fontWeight:   "500",
  transition:   "background 0.15s, color 0.15s",
  textDecoration: "none",
  color:        "rgba(147,197,253,0.6)",
};

// ── Componente ────────────────────────────────────────────────────
export function Sidebar({ empresa }) {
  const navigate           = useNavigate();
  const [reportesOpen, setReportesOpen] = useState(true);

  const tipoISP   = empresa?.tipo_isp ?? "ISP_RESIDENCIAL";
  const reportes  = REPORTES_POR_ISP[tipoISP] ?? REPORTES_POR_ISP.ISP_RESIDENCIAL;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresa");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="flex flex-col h-screen w-64 flex-shrink-0"
      style={{
        background:  "#021018",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.08)",
            border:     "1px solid rgba(255,255,255,0.12)",
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
            style={{ color: "rgba(147,197,253,0.5)" }}>
            Compliance TIC
          </p>
        </div>
      </div>

      {/* ── Empresa activa ── */}
      <div
        className="mx-3 mt-4 mb-2 px-3 py-3 rounded-xl"
        style={{
          background: "rgba(24,95,165,0.15)",
          border:     "1px solid rgba(56,136,211,0.2)",
        }}
      >
        <p className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: "rgba(147,197,253,0.45)" }}>
          Empresa activa
        </p>
        <p className="text-sm font-medium text-white leading-tight truncate">
          {empresa?.razon_social ?? "—"}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "rgba(147,197,253,0.45)" }}>
          NIT {empresa?.nit ?? "—"}
        </p>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">

        {/* Dashboard */}
        <NavLink
          to="/portal"
          end
          style={({ isActive }) => ({
            ...linkBase,
            background: isActive ? "rgba(24,95,165,0.25)" : "transparent",
            color:      isActive ? "white" : "rgba(147,197,253,0.6)",
            border:     isActive ? "1px solid rgba(56,136,211,0.3)" : "1px solid transparent",
          })}
        >
          <IconDashboard />
          Dashboard
        </NavLink>

        {/* Mis reportes — con submenú */}
        <div>
          <button
            onClick={() => setReportesOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
            style={{
              background: "transparent",
              border:     "1px solid transparent",
              color:      "rgba(147,197,253,0.6)",
              fontSize:   "13px",
              fontWeight: "500",
              cursor:     "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span className="flex items-center gap-2.5">
              <IconReportes />
              Mis reportes
            </span>
            <IconChevron open={reportesOpen} />
          </button>

          {/* Sub-items según tipo ISP */}
          {reportesOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-1 pl-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
              {reportes.map((r) => (
                <NavLink
                  key={r.path}
                  to={`/portal/${r.path}`}
                  style={({ isActive }) => ({
                    ...linkBase,
                    fontSize:   "12px",
                    padding:    "7px 10px",
                    background: isActive ? "rgba(24,95,165,0.2)" : "transparent",
                    color:      isActive ? "white" : "rgba(147,197,253,0.55)",
                    border:     isActive ? "1px solid rgba(56,136,211,0.25)" : "1px solid transparent",
                  })}
                >
                  <span className="flex-1">{r.label}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: r.badge === "CRC"
                        ? "rgba(56,136,211,0.15)"
                        : "rgba(94,161,221,0.1)",
                      color: r.badge === "CRC" ? "#93c5fd" : "#7dd3fc",
                      border: "1px solid rgba(56,136,211,0.2)",
                    }}
                  >
                    {r.badge}
                  </span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Calendario */}
        <NavLink
          to="/portal/calendario"
          style={({ isActive }) => ({
            ...linkBase,
            background: isActive ? "rgba(24,95,165,0.25)" : "transparent",
            color:      isActive ? "white" : "rgba(147,197,253,0.6)",
            border:     isActive ? "1px solid rgba(56,136,211,0.3)" : "1px solid transparent",
          })}
        >
          <IconCalendario />
          Calendario
        </NavLink>

        {/* Mi empresa */}
        <NavLink
          to="/portal/empresa"
          style={({ isActive }) => ({
            ...linkBase,
            background: isActive ? "rgba(24,95,165,0.25)" : "transparent",
            color:      isActive ? "white" : "rgba(147,197,253,0.6)",
            border:     isActive ? "1px solid rgba(56,136,211,0.3)" : "1px solid transparent",
          })}
        >
          <IconEmpresa />
          Mi empresa
        </NavLink>

      </nav>

      {/* ── Cerrar sesión ── */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
          style={{ color: "rgba(248,113,113,0.6)", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.08)";
            e.currentTarget.style.color      = "rgba(248,113,113,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "rgba(248,113,113,0.6)";
          }}
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}