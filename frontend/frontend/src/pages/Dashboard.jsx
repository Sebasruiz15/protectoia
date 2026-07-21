// archivo: src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useTema } from "@/context/ThemeContext";

// ── Datos mock ────────────────────────────────────────────────────
const OB_PENDIENTES = [
  {
    id: 1,
    nombre: "Compensación TV — 2T 2026",
    fecha: "31 jul 2026",
    entidad: "MinTIC",
    dias: 46,
    color: "#f59e0b",
  },
  {
    id: 2,
    nombre: "Formato 7 — TV 2T 2026",
    fecha: "31 jul 2026",
    entidad: "MinTIC",
    dias: 46,
    color: "#f59e0b",
  },
  {
    id: 3,
    nombre: "FUTIC internet — Jun 2026",
    fecha: "15 jul 2026",
    entidad: "MinTIC",
    dias: 30,
    color: "#f59e0b",
  },
  {
    id: 4,
    nombre: "Reporte T.1.2 — 2T 2026",
    fecha: "31 jul 2026",
    entidad: "CRC/HECAA",
    dias: 46,
    color: "#f59e0b",
  },
];

const OB_COMPLETADAS = [
  {
    id: 5,
    nombre: "Compensación TV — 1T 2026",
    fecha: "28 abr 2026",
    entidad: "MinTIC",
  },
  {
    id: 6,
    nombre: "Formato T.1.2 — 1T 2026",
    fecha: "30 abr 2026",
    entidad: "CRC",
  },
  {
    id: 7,
    nombre: "FUTIC internet — May 2026",
    fecha: "14 may 2026",
    entidad: "MinTIC",
  },
];

const ACTIVIDAD = [
  {
    ic: "✓",
    c: "#34d399",
    bg: "rgba(52,211,153,0.15)",
    t: "T.1.2 cargado en HECAA",
    s: "Hace 2 días",
  },
  {
    ic: "✓",
    c: "#34d399",
    bg: "rgba(52,211,153,0.15)",
    t: "Compensación TV 1T pagada",
    s: "Hace 7 semanas",
  },
  {
    ic: "↑",
    c: "#185FA5",
    bg: "rgba(24,95,165,0.15)",
    t: "FUTIC mayo 2026 liquidado",
    s: "Hace 1 mes",
  },
];

const GRAFICA = [
  { t: "3T 25", i: 18.4, f: 0.35 },
  { t: "4T 25", i: 21.2, f: 0.4 },
  { t: "1T 26", i: 19.8, f: 0.38 },
  { t: "2T 26", i: 22.1, f: 0.42 },
];

// ── Hook contador ─────────────────────────────────────────────────
function useContador(obj, dur = 1000, on = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t0 = performance.now();
    let r;
    const f = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round(obj * (1 - Math.pow(1 - p, 3))));
      if (p < 1) r = requestAnimationFrame(f);
    };
    r = requestAnimationFrame(f);
    return () => cancelAnimationFrame(r);
  }, [on, obj, dur]);
  return v;
}

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ children, color }) {
  const p = {
    green: ["rgba(52,211,153,0.15)", "rgba(52,211,153,0.35)", "#065f46"],
    amber: ["rgba(245,158,11,0.15)", "rgba(245,158,11,0.35)", "#92400e"],
    blue: ["rgba(24,95,165,0.12)", "rgba(24,95,165,0.3)", "#1e3a5f"],
  }[color];
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "600",
        padding: "2px 8px",
        borderRadius: "20px",
        background: p[0],
        border: `0.5px solid ${p[1]}`,
        color: p[2],
      }}
    >
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
    <div
      style={{
        background: "var(--border-card)",
        borderRadius: "3px",
        height: "3px",
        overflow: "hidden",
        marginTop: "5px",
      }}
    >
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: color,
          borderRadius: "3px",
          transition: "width 1s ease",
        }}
      />
    </div>
  );
}

// ── Fila obligación ───────────────────────────────────────────────
function FilaOb({ ob, done }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 8px",
        borderRadius: "7px",
        marginBottom: "3px",
        cursor: "pointer",
        transition: "background 0.15s",
        background: "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-card-hover)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          flexShrink: 0,
          background: done ? "#34d399" : ob.color,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "500",
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ob.nombre}
        </p>
        <p
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            marginTop: "1px",
          }}
        >
          {done ? `✓ ${ob.fecha}` : `Vence ${ob.fecha}`} · {ob.entidad}
        </p>
      </div>
      {done ? (
        <Badge color="green">OK</Badge>
      ) : (
        <span
          style={{
            fontSize: "10px",
            fontWeight: "600",
            color: ob.color,
            whiteSpace: "nowrap",
          }}
        >
          {ob.dias}d
        </span>
      )}
    </div>
  );
}

// ── Mini calendario ───────────────────────────────────────────────
function Calendario() {
  const { tema } = useTema();
  const isDark = tema === "dark";
  const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
  const OFFSET = 6;
  const ESP_JUL = { 15: "vence", 31: "critico" };

  const s = {
    normal: { color: "var(--text-muted)", bg: "transparent" },
    hoy: { color: "white", bg: "#185FA5" },
    vence: {
      color: isDark ? "#fbbf24" : "#92400e",
      bg: isDark ? "rgba(251,191,36,0.15)" : "rgba(245,158,11,0.12)",
    },
    critico: {
      color: isDark ? "#f87171" : "#991b1b",
      bg: isDark ? "rgba(248,113,113,0.15)" : "rgba(239,68,68,0.1)",
    },
    opaco: { color: "var(--text-muted)", bg: "transparent", opacity: 0.3 },
  };

  const Dia = ({ n, t = "normal" }) => (
    <div
      style={{
        aspectRatio: "1",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "9px",
        fontWeight: t === "hoy" ? "600" : "400",
        background: s[t].bg,
        color: s[t].color,
        opacity: s[t].opacity ?? 1,
      }}
    >
      {n}
    </div>
  );

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <p
        style={{
          fontSize: "9px",
          fontWeight: "600",
          letterSpacing: "0.09em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          display: "block",
          marginBottom: "8px",
        }}
      >
        Jun · Jul 2026
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
        {[
          ["#185FA5", "Hoy"],
          ["#f59e0b", "Vence"],
          ["#ef4444", "Crítico"],
        ].map(([c, l]) => (
          <span
            key={l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "8px",
              color: "var(--text-muted)",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: c,
                display: "inline-block",
              }}
            />
            {l}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px",
        }}
      >
        {DIAS.map((d) => (
          <div
            key={d}
            style={{
              fontSize: "8px",
              color: "var(--text-muted)",
              textAlign: "center",
              paddingBottom: "2px",
              opacity: 0.6,
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: OFFSET }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
          <Dia key={`j${d}`} n={d} t={d === 15 ? "hoy" : "normal"} />
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <Dia key={`jul${d}`} n={d} t={ESP_JUL[d] ?? "opaco"} />
        ))}
      </div>
    </div>
  );
}

// ── Gráfica barras ────────────────────────────────────────────────
function Grafica() {
  const { tema } = useTema();
  const isDark   = tema === "dark";

  const barIngreso = isDark ? "rgba(56,136,211,0.7)"   : "rgba(24,95,165,0.75)";
  const barFutic   = isDark ? "rgba(52,211,153,0.65)"  : "rgba(5,150,105,0.7)";
  const textColor  = isDark ? "rgba(147,197,253,0.5)"  : "#64748b";
  const lineColor  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";

  const H    = 70;   // altura de las barras
  const PAD  = 16;   // padding superior para que el label no se corte
  const MAX  = 25;
  const TOTAL = H + PAD;

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
        {[[barIngreso,"Ingresos ISP"],[barFutic,"FUTIC"]].map(([c,l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "9px", color: "var(--text-muted)" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: c }} />{l}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 280 ${TOTAL + 14}`} style={{ width: "100%", overflow: "visible" }}>
        {/* Líneas guía */}
        {[0.5, 1].map((p) => (
          <g key={p}>
            <line
              x1="38" y1={PAD + H - H * p}
              x2="278" y2={PAD + H - H * p}
              stroke={lineColor} strokeWidth="1"
            />
            <text
              x="36" y={PAD + H - H * p + 3}
              textAnchor="end" fontSize="7" fill={textColor}
            >
              ${MAX * p}M
            </text>
          </g>
        ))}

        {/* Barras */}
        {GRAFICA.map((d, i) => {
          const x  = 44 + i * 58;
          const aI = (d.i / MAX) * H;
          const aF = (d.f / 0.5) * H * 0.28;
          return (
            <g key={d.t}>
              <rect x={x}      y={PAD + H - aI} width="18" height={aI} rx="3" fill={barIngreso} />
              <rect x={x + 21} y={PAD + H - aF} width="18" height={aF} rx="3" fill={barFutic}   />
              <text
                x={x + 18} y={PAD + H + 11}
                textAnchor="middle" fontSize="7" fill={textColor}
              >
                {d.t}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Dona ──────────────────────────────────────────────────────────
function Dona() {
  const { tema } = useTema();
  const isDark = tema === "dark";

  const datos = [
    { l: "Al día", p: 75, c: "#10b981" },
    { l: "Próximo", p: 17, c: "#f59e0b" },
    { l: "Crítico", p: 8, c: "#ef4444" },
  ];
  const R = 24,
    CX = 30,
    CY = 30,
    circ = 2 * Math.PI * R;
  let off = 0;
  const arcos = datos.map((d) => {
    const dash = (d.p / 100) * circ;
    const rot = (off / 100) * 360 - 90;
    off += d.p;
    return { ...d, dash, gap: circ - dash, rot };
  });

  const trackColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const pctColor = isDark ? "white" : "#0a1628";
  const lblColor = isDark ? "rgba(147,197,253,0.5)" : "#64748b";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 60 60" style={{ width: "60px", flexShrink: 0 }}>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
        />
        {arcos.map((a) => (
          <circle
            key={a.l}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={a.c}
            strokeWidth="8"
            strokeDasharray={`${a.dash} ${a.gap}`}
            transform={`rotate(${a.rot} ${CX} ${CY})`}
          />
        ))}
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={pctColor}
        >
          75%
        </text>
        <text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          fontSize="6"
          fill={lblColor}
        >
          al día
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {datos.map((d) => (
          <div
            key={d.l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: d.c,
                flexShrink: 0,
              }}
            />
            {d.l} · {d.p}%
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Acción rápida ─────────────────────────────────────────────────
function Accion({ ic, label, to }) {
  return (
    <a
      href={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "8px",
        background: "var(--bg-card-hover)",
        border: "0.5px solid var(--border-card)",
        textDecoration: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent-soft)";
        e.currentTarget.style.borderColor = "var(--accent-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-card-hover)";
        e.currentTarget.style.borderColor = "var(--border-card)";
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-soft)",
          fontSize: "13px",
          flexShrink: 0,
        }}
      >
        {ic}
      </div>
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          fontWeight: "500",
        }}
      >
        {label}
      </span>
    </a>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
export function Dashboard() {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const [tab, setTab] = useState("pendientes");
  const [activo, setActivo] = useState(false);
  const futic = useContador(419900, 1200, activo);

  useEffect(() => {
    const t = setTimeout(() => setActivo(true), 200);
    return () => clearTimeout(t);
  }, []);

  const tipoLabel =
    empresa.tipo_isp === "ISP_TV" ? "Internet + TV" : "Internet";

  // Estilos de card unificados
  const card = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: "12px",
    padding: "14px",
  };

  const cardLabel = {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.09em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "1400px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            Bienvenido, {empresa.razon_social ?? "Empresa"} 👋
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            Resumen regulatorio · 2T 2026 · {tipoLabel}
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <Badge color="green">✓ Al día</Badge>
          <Badge color="amber">⚠ 2 próximos</Badge>
        </div>
      </div>

      {/* Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "10px",
        }}
      >
        <div style={card}>
          <span style={cardLabel}>Obligaciones al día</span>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            {activo ? "8 / 10" : "—"}
          </p>
          <Progreso pct={80} color="#10b981" delay={200} />
        </div>

        <div style={card}>
          <span style={cardLabel}>Próximo vencimiento</span>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            31 jul 2026
          </p>
          <span
            style={{
              fontSize: "10px",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#f59e0b",
                display: "inline-block",
              }}
            />
            46 días · Compensación TV
          </span>
        </div>

        <div style={card}>
          <span style={cardLabel}>Reportes generados</span>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            {activo ? "5" : "—"}
          </p>
          <Progreso pct={50} color="#185FA5" delay={400} />
          <div style={{ marginTop: "5px" }}>
            <Badge color="blue">T.1.2 + F.7</Badge>
          </div>
        </div>

        <div style={card}>
          <span style={cardLabel}>FUTIC estimado</span>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            ${futic.toLocaleString("es-CO")}
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Jun 2026
          </p>
        </div>
      </div>

      {/* Obligaciones + Calendario + Dona/Acciones */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px 180px",
          gap: "10px",
        }}
      >
        {/* Obligaciones */}
        <div style={card}>
          <span style={cardLabel}>Obligaciones regulatorias</span>
          <div
            style={{
              display: "flex",
              gap: "2px",
              background: "var(--bg-base)",
              borderRadius: "7px",
              padding: "2px",
              marginBottom: "8px",
            }}
          >
            {["pendientes", "completadas"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "5px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border:
                    tab === t
                      ? "0.5px solid var(--accent-border)"
                      : "0.5px solid transparent",
                  background: tab === t ? "var(--accent-soft)" : "transparent",
                  color: tab === t ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {t === "pendientes" ? "Pendientes" : "Completadas"}
              </button>
            ))}
          </div>
          {(tab === "pendientes" ? OB_PENDIENTES : OB_COMPLETADAS).map((ob) => (
            <FilaOb key={ob.id} ob={ob} done={tab === "completadas"} />
          ))}
        </div>

        {/* Calendario */}
        <Calendario />

        {/* Columna derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={card}>
            <span style={cardLabel}>Cumplimiento 2026</span>
            <Dona />
          </div>
          <div style={card}>
            <span style={cardLabel}>Acciones rápidas</span>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <Accion ic="📋" label="Nuevo T.1.2" to="/portal/reportes/t12" />
              <Accion ic="📺" label="Nuevo F.7" to="/portal/reportes/f7" />
              <Accion ic="📅" label="Calendario" to="/portal/calendario" />
              <Accion ic="📁" label="Historial" to="/portal/empresa" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica + Actividad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px",
          gap: "10px",
        }}
      >
        <div style={card}>
          <span style={cardLabel}>Ingresos ISP vs FUTIC por trimestre</span>
          <Grafica />
        </div>

        <div style={card}>
          <span style={cardLabel}>Actividad reciente</span>
          {ACTIVIDAD.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "8px",
                padding: "7px 0",
                borderBottom:
                  i < ACTIVIDAD.length - 1
                    ? `0.5px solid var(--border-card)`
                    : "none",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: a.bg,
                  color: a.c,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {a.ic}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-primary)",
                    fontWeight: "500",
                  }}
                >
                  {a.t}
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    color: "var(--text-muted)",
                    marginTop: "1px",
                  }}
                >
                  {a.s}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{
              borderTop: `0.5px solid var(--border-card)`,
              marginTop: "10px",
              paddingTop: "10px",
            }}
          >
            <span style={cardLabel}>Resumen trimestral</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {[
                { label: "FUTIC total 2026", valor: "$796K", color: "#185FA5" },
                { label: "TV compensación", valor: "$360K", color: "#185FA5" },
                { label: "Reportes CRC", valor: "2", color: "#10b981" },
                { label: "Reportes MinTIC", valor: "2", color: "#10b981" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--bg-base)",
                    borderRadius: "7px",
                    padding: "6px 8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      color: "var(--text-muted)",
                      marginBottom: "3px",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: s.color,
                    }}
                  >
                    {s.valor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
