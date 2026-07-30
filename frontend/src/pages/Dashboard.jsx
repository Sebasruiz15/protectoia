// archivo: src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useTema } from "@/context/ThemeContext";
import { api } from "@/services/api";

// ── Hook para cargar datos del dashboard ──────────────────────────
function useDashboard() {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get("/dashboard/empresa");
        setDatos(data);
      } catch (err) {
        setError(err.mensaje ?? "Error al cargar el dashboard.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return { datos, cargando, error };
}

// ── Colores por estado de reporte ─────────────────────────────────
const ESTADO_REPORTE = {
  borrador:             { color: "#64748b", bg: "rgba(100,116,139,0.1)",  label: "Borrador"             },
  pendiente_revision:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   label: "Pendiente revisión"   },
  aprobado:             { color: "#10b981", bg: "rgba(16,185,129,0.1)",   label: "Aprobado"             },
  con_observaciones:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   label: "Con observaciones"    },
  rechazado:            { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    label: "Rechazado"            },
};

// ── Badge estado ──────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const e = ESTADO_REPORTE[estado] ?? ESTADO_REPORTE.borrador;
  return (
    <span style={{
      fontSize: "10px", fontWeight: "600", padding: "2px 8px",
      borderRadius: "20px",
      background: e.bg,
      color:      e.color,
      border:     `0.5px solid ${e.color}40`,
      whiteSpace: "nowrap",
    }}>
      {e.label}
    </span>
  );
}

// ── Badge genérico ────────────────────────────────────────────────
function Badge({ children, color }) {
  const p = {
    green: ["rgba(16,185,129,0.15)",  "rgba(16,185,129,0.35)",  "#065f46"],
    amber: ["rgba(245,158,11,0.15)",  "rgba(245,158,11,0.35)",  "#92400e"],
    blue:  ["rgba(24,95,165,0.12)",   "rgba(24,95,165,0.3)",    "#1e3a5f"],
    red:   ["rgba(239,68,68,0.12)",   "rgba(239,68,68,0.3)",    "#7f1d1d"],
  }[color] ?? ["rgba(100,116,139,0.12)", "rgba(100,116,139,0.3)", "#1e293b"];

  return (
    <span style={{
      fontSize: "10px", fontWeight: "600", padding: "2px 8px",
      borderRadius: "20px", background: p[0],
      border: `0.5px solid ${p[1]}`, color: p[2],
    }}>
      {children}
    </span>
  );
}

// ── Barra progreso ────────────────────────────────────────────────
function Progreso({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ background: "var(--border-card)", borderRadius: "3px", height: "3px", overflow: "hidden", marginTop: "5px" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 1s ease" }} />
    </div>
  );
}

// ── Calendarioo regulatorio ───────────────────────────────────────
function Calendario({ trimestre, anio, diasRestantes }) {
  const { tema } = useTema();
  const isDark   = tema === "dark";
  const DIAS     = ["L","M","M","J","V","S","D"];

  // Mes de vencimiento según trimestre
  const INFO_TRIM = {
    "1T": { meses: ["Ene","Feb","Mar"], vence: "15 may" },
    "2T": { meses: ["Abr","May","Jun"], vence: "14 ago" },
    "3T": { meses: ["Jul","Ago","Sep"], vence: "14 nov" },
    "4T": { meses: ["Oct","Nov","Dic"], vence: "14 feb" },
  };

  const info      = INFO_TRIM[trimestre] ?? INFO_TRIM["3T"];
  const nivelRiesgo = diasRestantes < 15 ? "critico" : diasRestantes < 45 ? "proximo" : "al_dia";
  const colorRiesgo = nivelRiesgo === "critico" ? "#ef4444" : nivelRiesgo === "proximo" ? "#f59e0b" : "#10b981";

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "14px" }}>
      <p style={{ fontSize: "9px", fontWeight: "600", letterSpacing: "0.09em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
        {trimestre} {anio} · Vence {info.vence}
      </p>

      <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
        {info.meses.map((m) => (
          <span key={m} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "var(--accent-soft)", color: "var(--accent)", border: "0.5px solid var(--accent-border)" }}>
            {m}
          </span>
        ))}
      </div>

      <div style={{
        padding: "10px 12px", borderRadius: "8px",
        background: nivelRiesgo === "critico" ? "rgba(239,68,68,0.08)" : nivelRiesgo === "proximo" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
        border: `0.5px solid ${colorRiesgo}40`,
      }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: colorRiesgo }}>
          {diasRestantes} días para el vencimiento
        </p>
        <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
          {nivelRiesgo === "critico" ? "⚠ Urgente — entrega inmediata" : nivelRiesgo === "proximo" ? "Prepara el reporte pronto" : "✓ Tienes tiempo suficiente"}
        </p>
      </div>
    </div>
  );
}

// ── Fila de reporte ───────────────────────────────────────────────
function FilaReporte({ reporte, tipo }) {
  const fecha = new Date(reporte.created_at).toLocaleDateString("es-CO");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "7px 8px", borderRadius: "7px", marginBottom: "3px",
      background: "transparent", transition: "background 0.15s", cursor: "pointer",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tipo} — {reporte.trimestre} {reporte.anio}
        </p>
        <p style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "1px" }}>
          Enviado {fecha}
        </p>
      </div>
      <BadgeEstado estado={reporte.estado} />
    </div>
  );
}

// ── Acción rápida ─────────────────────────────────────────────────
function Accion({ ic, label, to }) {
  return (
    <a href={to} style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "8px 10px", borderRadius: "8px",
      background: "var(--bg-card-hover)",
      border: "0.5px solid var(--border-card)",
      textDecoration: "none", transition: "all 0.15s",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background  = "var(--accent-soft)";
        e.currentTarget.style.borderColor = "var(--accent-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background  = "var(--bg-card-hover)";
        e.currentTarget.style.borderColor = "var(--border-card)";
      }}
    >
      <div style={{ width: "26px", height: "26px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-soft)", fontSize: "13px", flexShrink: 0 }}>
        {ic}
      </div>
      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>
        {label}
      </span>
    </a>
  );
}

// ── Skeleton de carga ─────────────────────────────────────────────
function Skeleton({ h = "20px", w = "100%", mb = "0" }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: "6px", marginBottom: mb,
      background: "var(--border-card)",
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
export function Dashboard() {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const { datos, cargando, error } = useDashboard();

  const card = {
    background:   "var(--bg-card)",
    border:       "1px solid var(--border-card)",
    borderRadius: "12px",
    padding:      "14px",
  };

  const cardLabel = {
    fontSize: "9px", fontWeight: "600", letterSpacing: "0.09em",
    color: "var(--text-muted)", textTransform: "uppercase",
    display: "block", marginBottom: "6px",
  };

  // ── Estado de carga ──
  if (cargando) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "1400px" }}>
        <Skeleton h="24px" w="300px" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {[1,2,3,4].map((i) => <div key={i} style={card}><Skeleton h="60px" /></div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 180px", gap: "10px" }}>
          <div style={card}><Skeleton h="200px" /></div>
          <div style={card}><Skeleton h="200px" /></div>
          <div style={card}><Skeleton h="200px" /></div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{ ...card, maxWidth: "500px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <p style={{ fontSize: "13px", color: "#ef4444" }}>⚠ {error}</p>
      </div>
    );
  }

  const resumen       = datos?.resumen        ?? {};
  const reportesT12   = datos?.reportes_t12   ?? [];
  const reportesF7    = datos?.reportes_f7    ?? [];
  const todosReportes = [...reportesT12.map(r => ({ ...r, tipo: "T.1.2" })),
                          ...reportesF7.map(r => ({ ...r, tipo: "F.7" }))]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const tipoLabel = empresa.tipo_isp === "ISP_TV" ? "Internet + TV" : "Internet";
  const pctCumplimiento = resumen.total_reportes > 0
    ? Math.round((resumen.reportes_aprobados / resumen.total_reportes) * 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "1400px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)" }}>
            Bienvenido, {empresa.razon_social ?? "Empresa"} 👋
          </h1>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            Resumen regulatorio · {resumen.trimestre_actual} {resumen.anio_actual} · {tipoLabel}
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {resumen.dias_al_vencimiento < 15
            ? <Badge color="red">⚠ Vence pronto</Badge>
            : resumen.dias_al_vencimiento < 45
            ? <Badge color="amber">⚠ {resumen.dias_al_vencimiento}d al vencimiento</Badge>
            : <Badge color="green">✓ Al día</Badge>
          }
          {resumen.reporte_actual
            ? <BadgeEstado estado={resumen.reporte_actual.estado} />
            : <Badge color="amber">Sin reporte {resumen.trimestre_actual}</Badge>
          }
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>

        <div style={card}>
          <span style={cardLabel}>Reportes enviados</span>
          <p style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)" }}>
            {resumen.total_reportes}
          </p>
          <Progreso pct={Math.min(resumen.total_reportes * 20, 100)} color="#185FA5" delay={200} />
        </div>

        <div style={card}>
          <span style={cardLabel}>Próximo vencimiento</span>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>
            {resumen.dias_al_vencimiento} días
          </p>
          <span style={{
            fontSize: "10px",
            color: resumen.dias_al_vencimiento < 15 ? "#ef4444" : resumen.dias_al_vencimiento < 45 ? "#f59e0b" : "#10b981",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            {resumen.trimestre_actual} {resumen.anio_actual}
          </span>
        </div>

        <div style={card}>
          <span style={cardLabel}>Reportes aprobados</span>
          <p style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)" }}>
            {resumen.reportes_aprobados}
          </p>
          <Progreso pct={pctCumplimiento} color="#10b981" delay={400} />
          {resumen.total_reportes > 0 && (
            <div style={{ marginTop: "5px" }}>
              <Badge color="green">{pctCumplimiento}% aprobados</Badge>
            </div>
          )}
        </div>

        <div style={card}>
          <span style={cardLabel}>Estado trimestre actual</span>
          {resumen.reporte_actual ? (
            <>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "6px" }}>
                {resumen.trimestre_actual} {resumen.anio_actual}
              </p>
              <BadgeEstado estado={resumen.reporte_actual.estado} />
            </>
          ) : (
            <>
              <p style={{ fontSize: "13px", fontWeight: "500", color: "#f59e0b", marginBottom: "4px" }}>
                Sin reporte
              </p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                No has enviado el {resumen.trimestre_actual}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Reportes + Calendario + Acciones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 180px", gap: "10px" }}>

        {/* Mis reportes */}
        <div style={card}>
          <span style={cardLabel}>Mis reportes</span>

          {todosReportes.length === 0 ? (
            <div style={{
              padding: "24px", textAlign: "center",
              background: "var(--bg-input)", borderRadius: "8px",
            }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                📋 No tienes reportes enviados aún
              </p>
              <a href="/portal/reportes/t12" style={{
                fontSize: "11px", color: "var(--accent)", fontWeight: "500",
                textDecoration: "none",
              }}>
                Crear primer reporte T.1.2 →
              </a>
            </div>
          ) : (
            todosReportes.map((r) => (
              <FilaReporte key={`${r.tipo}-${r.id}`} reporte={r} tipo={r.tipo} />
            ))
          )}
        </div>

        {/* Calendario */}
        <Calendario
          trimestre={resumen.trimestre_actual}
          anio={resumen.anio_actual}
          diasRestantes={resumen.dias_al_vencimiento}
        />

        {/* Acciones rápidas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={card}>
            <span style={cardLabel}>Acciones rápidas</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Accion ic="📋" label="Nuevo T.1.2"  to="/portal/reportes/t12" />
              {(empresa.tipo_isp === "ISP_TV" || empresa.tipo_isp === "ISP_TV_MIXTO") && (
                <Accion ic="📺" label="Nuevo F.7"  to="/portal/reportes/f7" />
              )}
              <Accion ic="📅" label="Calendario"   to="/portal/calendario" />
              <Accion ic="🏢" label="Mi empresa"   to="/portal/empresa" />
            </div>
          </div>

          {/* Resumen */}
          <div style={card}>
            <span style={cardLabel}>Resumen</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { label: "T.1.2 enviados", valor: reportesT12.length, color: "#185FA5" },
                { label: "F.7 enviados",   valor: reportesF7.length,  color: "#10b981" },
                { label: "Aprobados",      valor: resumen.reportes_aprobados, color: "#10b981" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--bg-input)", borderRadius: "7px", padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{s.label}</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: s.color }}>{s.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}