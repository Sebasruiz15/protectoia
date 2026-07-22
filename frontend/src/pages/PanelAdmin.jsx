// archivo: src/pages/PanelAdmin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "@/context/ThemeContext";
import { EMPRESAS_MOCK, STATS_ADMIN } from "@/data/empresasMock";

// ── Íconos ────────────────────────────────────────────────────────
const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconSol = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);
const IconLuna = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ── Colores por nivel de riesgo ───────────────────────────────────
const NIVEL = {
  al_dia:  { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)",  label: "Al día"   },
  proximo: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  label: "Próximo"  },
  critico: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   label: "Crítico"  },
};

const TIPO_LABEL = {
  ISP_RESIDENCIAL: "Residencial",
  ISP_EMPRESARIAL: "Empresarial",
  ISP_MIXTO:       "Mixto",
  ISP_TV:          "Internet + TV",
  ISP_TV_MIXTO:    "Mixto + TV",
};

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ nivel }) {
  const n = NIVEL[nivel] ?? NIVEL.al_dia;
  return (
    <span style={{
      fontSize: "10px", fontWeight: "600", padding: "2px 8px",
      borderRadius: "20px", background: n.bg,
      border: `0.5px solid ${n.border}`, color: n.color,
      whiteSpace: "nowrap",
    }}>
      {n.label}
    </span>
  );
}

// ── Tarjeta métrica ───────────────────────────────────────────────
function MetricaCard({ label, valor, color, sub }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-card)",
      borderRadius: "12px", padding: "14px",
    }}>
      <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
        {label}
      </p>
      <p style={{ fontSize: "24px", fontWeight: "600", color: color ?? "var(--text-primary)" }}>
        {valor}
      </p>
      {sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

// ── Vista detalle empresa ─────────────────────────────────────────
function DetalleEmpresa({ empresa, onVolver }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onVolver}
          style={{
            background: "var(--bg-input)", border: "1px solid var(--border-card)",
            borderRadius: "8px", padding: "6px 12px", fontSize: "12px",
            color: "var(--text-muted)", cursor: "pointer",
          }}
        >
          ← Volver
        </button>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)" }}>
            {empresa.razon_social}
          </h2>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            NIT {empresa.nit} · {TIPO_LABEL[empresa.tipo_isp]} · {empresa.municipio}
          </p>
        </div>
        <Badge nivel={empresa.nivel_riesgo} />
      </div>

      {/* Métricas de la empresa */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        <MetricaCard label="Obligaciones al día"  valor={empresa.obligaciones.al_dia}   color="#10b981" sub={`de ${empresa.obligaciones.total} totales`} />
        <MetricaCard label="Próximas a vencer"    valor={empresa.obligaciones.proximas}  color="#f59e0b" />
        <MetricaCard label="Obligaciones críticas" valor={empresa.obligaciones.criticas} color="#ef4444" />
        <MetricaCard label="Reportes generados"   valor={empresa.reportes_generados}    color="#185FA5" />
      </div>

      {/* Info de la empresa */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
            Datos del operador
          </p>
          {[
            { label: "Representante legal", valor: empresa.rep_legal },
            { label: "Correo",              valor: empresa.email      },
            { label: "Municipio",           valor: empresa.municipio  },
            { label: "Tipo de ISP",         valor: TIPO_LABEL[empresa.tipo_isp] },
            { label: "Último reporte",      valor: empresa.ultimo_reporte },
            { label: "Próximo vencimiento", valor: empresa.proximo_vence  },
          ].map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "7px 0", borderBottom: "0.5px solid var(--border-card)",
            }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.label}</span>
              <span style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-primary)" }}>{r.valor}</span>
            </div>
          ))}
        </div>

        {/* Obligaciones */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
            Estado regulatorio
          </p>

          {/* Barra de progreso */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cumplimiento general</span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#10b981" }}>
                {Math.round((empresa.obligaciones.al_dia / empresa.obligaciones.total) * 100)}%
              </span>
            </div>
            <div style={{ background: "var(--border-card)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
              <div style={{
                width: `${(empresa.obligaciones.al_dia / empresa.obligaciones.total) * 100}%`,
                height: "100%", background: "#10b981", borderRadius: "4px",
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>

          {/* Distribución */}
          {[
            { label: "Al día",   valor: empresa.obligaciones.al_dia,   color: "#10b981" },
            { label: "Próximas", valor: empresa.obligaciones.proximas,  color: "#f59e0b" },
            { label: "Críticas", valor: empresa.obligaciones.criticas,  color: "#ef4444" },
          ].map((o) => (
            <div key={o.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 10px", borderRadius: "8px", marginBottom: "6px",
              background: "var(--bg-input)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: o.color, display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{o.label}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "600", color: o.color }}>{o.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel Admin principal ─────────────────────────────────────────
export function PanelAdmin() {
  const navigate              = useNavigate();
  const { tema, toggleTema }  = useTema();
  const isDark                = tema === "dark";

  const admin = JSON.parse(localStorage.getItem("empresa") ?? "{}");

  const [busqueda,        setBusqueda]        = useState("");
  const [filtroRiesgo,    setFiltroRiesgo]    = useState("todos");
  const [empresaDetalle,  setEmpresaDetalle]  = useState(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresa");
    navigate("/login", { replace: true });
  };

  const empresasFiltradas = EMPRESAS_MOCK.filter((e) => {
    const matchBusqueda = e.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
                          e.nit.includes(busqueda);
    const matchRiesgo   = filtroRiesgo === "todos" || e.nivel_riesgo === filtroRiesgo;
    return matchBusqueda && matchRiesgo;
  });

  const btnStyle = {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s",
    flexShrink: 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Topbar admin ── */}
      <header style={{
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        background: "var(--bg-topbar)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#185FA5", color: "white",
          }}>
            <IconBolt />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", lineHeight: 1.2 }}>
              IA System Group
            </p>
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
              Panel de administración
            </p>
          </div>

          {/* Badge admin */}
          <span style={{
            fontSize: "10px", fontWeight: "600", padding: "2px 8px",
            borderRadius: "20px", background: "rgba(24,95,165,0.15)",
            border: "0.5px solid rgba(24,95,165,0.3)", color: "#185FA5",
            marginLeft: "8px",
          }}>
            ADMIN
          </span>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={toggleTema} style={btnStyle} title="Cambiar tema">
            {isDark ? <IconSol /> : <IconLuna />}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              background: "#185FA5", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white",
            }}>
              IA
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>
                {admin.email ?? "admin@iasystemgroup.co"}
              </p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Administrador</p>
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            style={{ ...btnStyle, color: "rgba(239,68,68,0.7)", marginLeft: "4px" }}
            title="Cerrar sesión"
          >
            <IconLogout />
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px 24px" }}>

        {empresaDetalle ? (
          <DetalleEmpresa
            empresa={empresaDetalle}
            onVolver={() => setEmpresaDetalle(null)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Header */}
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: "500", color: "var(--text-primary)" }}>
                Panel de seguimiento regulatorio
              </h1>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Vista global de todas las empresas · {new Date().toLocaleDateString("es-CO", { dateStyle: "long" })}
              </p>
            </div>

            {/* Métricas globales */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px" }}>
              <MetricaCard label="Total empresas"     valor={STATS_ADMIN.total_empresas}    color="var(--text-primary)" />
              <MetricaCard label="Al día"             valor={STATS_ADMIN.empresas_al_dia}   color="#10b981" />
              <MetricaCard label="Próximas a vencer"  valor={STATS_ADMIN.empresas_proximas} color="#f59e0b" />
              <MetricaCard label="En riesgo crítico"  valor={STATS_ADMIN.empresas_criticas} color="#ef4444" />
              <MetricaCard label="Reportes este mes"  valor={STATS_ADMIN.reportes_mes}      color="#185FA5" />
            </div>

            {/* Filtros y búsqueda */}
            <div style={{
              display: "flex", gap: "10px", alignItems: "center",
              background: "var(--bg-card)", border: "1px solid var(--border-card)",
              borderRadius: "12px", padding: "12px 16px",
            }}>
              {/* Búsqueda */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "8px", padding: "7px 12px" }}>
                <IconSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre o NIT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "var(--text-primary)", width: "100%" }}
                />
              </div>

              {/* Filtro riesgo */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[
                  { id: "todos",   label: "Todos"    },
                  { id: "al_dia",  label: "Al día"   },
                  { id: "proximo", label: "Próximos" },
                  { id: "critico", label: "Críticos" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFiltroRiesgo(f.id)}
                    style={{
                      padding: "6px 12px", borderRadius: "8px", fontSize: "11px",
                      fontWeight: "500", cursor: "pointer", transition: "all 0.15s",
                      background: filtroRiesgo === f.id ? "rgba(24,95,165,0.2)" : "transparent",
                      border: filtroRiesgo === f.id ? "0.5px solid rgba(24,95,165,0.4)" : "0.5px solid transparent",
                      color: filtroRiesgo === f.id ? "#185FA5" : "var(--text-muted)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {empresasFiltradas.length} empresa{empresasFiltradas.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Tabla de empresas */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-input)" }}>
                    {["Empresa","NIT","Tipo ISP","Municipio","Obligaciones","Último reporte","Próximo vence","Estado",""].map((h) => (
                      <th key={h} style={{
                        padding: "10px 14px", fontSize: "9px", fontWeight: "600",
                        letterSpacing: "0.07em", color: "var(--text-muted)",
                        textTransform: "uppercase", textAlign: "left",
                        borderBottom: "1px solid var(--border-card)",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((e, i) => (
                    <tr
                      key={e.id}
                      style={{ borderBottom: i < empresasFiltradas.length - 1 ? "0.5px solid var(--border-card)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(el) => (el.currentTarget.style.background = "var(--bg-card-hover)")}
                      onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>{e.razon_social}</p>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{e.email}</p>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{e.nit}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontSize: "10px", padding: "2px 7px", borderRadius: "20px",
                          background: "rgba(24,95,165,0.1)", color: "#185FA5",
                          border: "0.5px solid rgba(24,95,165,0.2)",
                        }}>
                          {TIPO_LABEL[e.tipo_isp] ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{e.municipio}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ background: "var(--border-card)", borderRadius: "3px", height: "4px", width: "60px", overflow: "hidden" }}>
                            <div style={{
                              width: `${(e.obligaciones.al_dia / e.obligaciones.total) * 100}%`,
                              height: "100%", background: "#10b981", borderRadius: "3px",
                            }} />
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {e.obligaciones.al_dia}/{e.obligaciones.total}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{e.ultimo_reporte}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "11px", color: NIVEL[e.nivel_riesgo]?.color ?? "var(--text-muted)", fontWeight: "500" }}>
                          {e.proximo_vence}
                        </span>
                        <p style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "1px" }}>
                          {e.dias_restantes}d restantes
                        </p>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge nivel={e.nivel_riesgo} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => setEmpresaDetalle(e)}
                          style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "5px 10px", borderRadius: "7px",
                            background: "rgba(24,95,165,0.1)", border: "0.5px solid rgba(24,95,165,0.25)",
                            color: "#185FA5", fontSize: "11px", fontWeight: "500", cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(el) => (el.currentTarget.style.background = "rgba(24,95,165,0.2)")}
                          onMouseLeave={(el) => (el.currentTarget.style.background = "rgba(24,95,165,0.1)")}
                        >
                          <IconEye /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}