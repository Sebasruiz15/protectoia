// archivo: src/pages/Dashboard.jsx
import { useState, useEffect } from "react";

// ── Datos mock ────────────────────────────────────────────────────
const OB_PENDIENTES = [
  { id: 1, nombre: "Compensación TV — 2T 2026", fecha: "31 jul 2026", entidad: "MinTIC", dias: 46, color: "#fbbf24" },
  { id: 2, nombre: "Formato 7 — TV 2T 2026", fecha: "31 jul 2026", entidad: "MinTIC", dias: 46, color: "#fbbf24" },
  { id: 3, nombre: "FUTIC internet — Jun 2026", fecha: "15 jul 2026", entidad: "MinTIC", dias: 30, color: "#fbbf24" },
  { id: 4, nombre: "Reporte T.1.2 — 2T 2026", fecha: "31 jul 2026", entidad: "CRC/HECAA", dias: 46, color: "#fbbf24" },
];

const OB_COMPLETADAS = [
  { id: 5, nombre: "Compensación TV — 1T 2026", fecha: "28 abr 2026", entidad: "MinTIC" },
  { id: 6, nombre: "Formato T.1.2 — 1T 2026", fecha: "30 abr 2026", entidad: "CRC" },
  { id: 7, nombre: "FUTIC internet — May 2026", fecha: "14 may 2026", entidad: "MinTIC" },
];

const ACTIVIDAD = [
  { ic: "✓", c: "#34d399", bg: "rgba(52,211,153,0.12)", t: "T.1.2 cargado en HECAA", s: "Hace 2 días" },
  { ic: "✓", c: "#34d399", bg: "rgba(52,211,153,0.12)", t: "Compensación TV 1T pagada", s: "Hace 7 semanas" },
  { ic: "↑", c: "#5EA1DD", bg: "rgba(56,136,211,0.12)", t: "FUTIC mayo 2026 liquidado", s: "Hace 1 mes" },
];

const GRAFICA = [
  { t: "3T 25", i: 18.4, f: 0.35 },
  { t: "4T 25", i: 21.2, f: 0.40 },
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

// ── Primitivos ────────────────────────────────────────────────────
const C = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "12px 14px",
  },
  label: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.09em",
    color: "rgba(147,197,253,0.4)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  },
};

function Badge({ children, color }) {
  const p = {
    green: ["rgba(52,211,153,0.15)", "rgba(52,211,153,0.3)", "#34d399"],
    amber: ["rgba(251,191,36,0.15)", "rgba(251,191,36,0.3)", "#fbbf24"],
    blue: ["rgba(56,136,211,0.15)", "rgba(56,136,211,0.3)", "#93c5fd"],
  }[color];
  return (
    <span style={{ fontSize: "9px", fontWeight: "600", padding: "2px 7px", borderRadius: "20px", background: p[0], border: `0.5px solid ${p[1]}`, color: p[2] }}>
      {children}
    </span>
  );
}

function Progreso({ pct, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "3px", height: "3px", overflow: "hidden", marginTop: "5px" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 1s ease" }} />
    </div>
  );
}

// ── Fila obligación ───────────────────────────────────────────────
function FilaOb({ ob, done }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "7px", marginBottom: "3px", cursor: "pointer", transition: "background 0.15s", background: "rgba(255,255,255,0.02)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
    >
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: done ? "#34d399" : ob.color }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "11px", fontWeight: "500", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ob.nombre}
        </p>
        <p style={{ fontSize: "9px", color: "rgba(147,197,253,0.4)", marginTop: "1px" }}>
          {done ? `✓ ${ob.fecha}` : `Vence ${ob.fecha}`} · {ob.entidad}
        </p>
      </div>
      {done
        ? <Badge color="green">OK</Badge>
        : <span style={{ fontSize: "10px", fontWeight: "600", color: ob.color }}>{ob.dias}d</span>
      }
    </div>
  );
}

// ── Mini calendario compacto ──────────────────────────────────────
function Calendario() {
  const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
  const OFFSET = 6;
  const ESP_JUL = { 15: "vence", 31: "critico" };

  const s = {
    normal: ["rgba(147,197,253,0.4)", "transparent"],
    hoy: ["white", "rgba(24,95,165,0.4)"],
    vence: ["#fbbf24", "rgba(251,191,36,0.15)"],
    critico: ["#f87171", "rgba(248,113,113,0.15)"],
    opaco: ["rgba(147,197,253,0.15)", "transparent"],
  };

  const Dia = ({ n, t = "normal" }) => (
    <div style={{ aspectRatio: "1", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: s[t][0], background: s[t][1] }}>
      {n}
    </div>
  );

  return (
    <div style={{ ...C.card }}>
      <span style={C.label}>Jun · Jul 2026</span>

      <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
        {[["#185FA5", "Hoy"], ["#fbbf24", "Vence"], ["#f87171", "Crítico"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "8px", color: "rgba(147,197,253,0.45)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: c, display: "inline-block" }} />
            {l}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
        {DIAS.map((d) => (
          <div key={d} style={{ fontSize: "8px", color: "rgba(147,197,253,0.3)", textAlign: "center", paddingBottom: "2px" }}>{d}</div>
        ))}
        {Array.from({ length: OFFSET }).map((_, i) => <div key={`e${i}`} />)}
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
  const datos = [
    { t: "3T 25", i: 18.4, f: 0.35 },
    { t: "4T 25", i: 21.2, f: 0.40 },
    { t: "1T 26", i: 19.8, f: 0.38 },
    { t: "2T 26", i: 22.1, f: 0.42 },
  ];

  const H = 70;
  const MAX = 25;

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

      {/* Barras */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
          {[["rgba(56,136,211,0.7)", "Ingresos ISP"], ["rgba(52,211,153,0.65)", "FUTIC"]].map(([c, l]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "9px", color: "rgba(147,197,253,0.5)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: c, display: "inline-block" }} />
              {l}
            </span>
          ))}
        </div>

        <svg viewBox="0 0 280 90" style={{ width: "100%", overflow: "visible" }}>
          {/* Línea base */}
          <line x1="32" y1={H} x2="278" y2={H} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Línea media */}
          <line x1="32" y1={H * 0.5} x2="278" y2={H * 0.5} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x="30" y={H * 0.5 + 3} textAnchor="end" fontSize="7" fill="rgba(147,197,253,0.35)">$12M</text>
          <text x="30" y={H + 3} textAnchor="end" fontSize="7" fill="rgba(147,197,253,0.35)">$0</text>

          {datos.map((d, i) => {
            const x = 40 + i * 60;
            const aI = (d.i / MAX) * H;
            const aF = (d.f / 0.5) * H * 0.22;

            return (
              <g key={d.t}>
                {/* Barra ingresos */}
                <rect x={x} y={H - aI} width="18" height={aI} rx="3"
                  fill="rgba(56,136,211,0.65)" />
                {/* Valor encima */}
                <text x={x + 9} y={H - aI - 3} textAnchor="middle" fontSize="7"
                  fill="rgba(147,197,253,0.5)">${d.i}M</text>

                {/* Barra FUTIC */}
                <rect x={x + 22} y={H - aF} width="18" height={aF} rx="3"
                  fill="rgba(52,211,153,0.6)" />
                {/* Valor encima */}
                <text x={x + 31} y={H - aF - 3} textAnchor="middle" fontSize="7"
                  fill="rgba(52,211,153,0.6)">${d.f}M</text>

                {/* Label trimestre */}
                <text x={x + 19} y={H + 12} textAnchor="middle" fontSize="8"
                  fill="rgba(147,197,253,0.4)">{d.t}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tabla resumen lateral */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px", paddingTop: "20px" }}>
        {datos.map((d) => (
          <div key={d.t} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px" }}>
            <span style={{ color: "rgba(147,197,253,0.4)", width: "32px" }}>{d.t}</span>
            <span style={{ color: "rgba(56,136,211,0.9)", width: "40px" }}>${d.i}M</span>
            <span style={{ color: "rgba(52,211,153,0.8)" }}>${(d.f * 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dona ──────────────────────────────────────────────────────────
function Dona() {
  const datos = [
    { l: "Al día", p: 75, c: "#34d399" },
    { l: "Próximo", p: 17, c: "#fbbf24" },
    { l: "Crítico", p: 8, c: "#f87171" },
  ];
  const R = 24, CX = 30, CY = 30, circ = 2 * Math.PI * R;
  let off = 0;
  const arcos = datos.map((d) => {
    const dash = (d.p / 100) * circ;
    const rot = (off / 100) * 360 - 90;
    off += d.p;
    return { ...d, dash, gap: circ - dash, rot };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 60 60" style={{ width: "60px", flexShrink: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {arcos.map((a) => (
          <circle key={a.l} cx={CX} cy={CY} r={R} fill="none" stroke={a.c} strokeWidth="8"
            strokeDasharray={`${a.dash} ${a.gap}`} transform={`rotate(${a.rot} ${CX} ${CY})`} />
        ))}
        <text x={CX} y={CY - 2} textAnchor="middle" fontSize="10" fontWeight="500" fill="white">75%</text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize="6" fill="rgba(147,197,253,0.5)">al día</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {datos.map((d) => (
          <div key={d.l} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "rgba(147,197,253,0.6)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: d.c, flexShrink: 0 }} />
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
    <a href={to} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", textDecoration: "none", transition: "all 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(24,95,165,0.2)"; e.currentTarget.style.borderColor = "rgba(56,136,211,0.35)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      <span style={{ fontSize: "14px" }}>{ic}</span>
      <span style={{ fontSize: "11px", color: "rgba(147,197,253,0.7)", fontWeight: "500" }}>{label}</span>
    </a>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
export function Dashboard() {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const [tab, setTab] = useState("pendientes");
  const [activo, setActivo] = useState(false);
  const futic = useContador(419900, 1200, activo);

  useEffect(() => { const t = setTimeout(() => setActivo(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "1400px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: "500", color: "white" }}>
            Bienvenido, {empresa.razon_social ?? "Empresa"} 👋
          </h1>
          <p style={{ fontSize: "11px", color: "rgba(147,197,253,0.45)", marginTop: "2px" }}>
            Resumen regulatorio · 2T 2026 · {empresa.tipo_isp === "ISP_TV" ? "Internet + TV" : "Internet"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <Badge color="green">✓ Al día</Badge>
          <Badge color="amber">⚠ 2 próximos</Badge>
        </div>
      </div>

      {/* ── Fila 1: 4 métricas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>

        <div style={C.card}>
          <span style={C.label}>Obligaciones al día</span>
          <p style={{ fontSize: "20px", fontWeight: "500", color: "white" }}>{activo ? "8 / 10" : "—"}</p>
          <Progreso pct={80} color="#34d399" delay={200} />
        </div>

        <div style={C.card}>
          <span style={C.label}>Próximo vencimiento</span>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "white", marginBottom: "4px" }}>31 jul 2026</p>
          <span style={{ fontSize: "10px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
            46 días · Compensación TV
          </span>
        </div>

        <div style={C.card}>
          <span style={C.label}>Reportes generados</span>
          <p style={{ fontSize: "20px", fontWeight: "500", color: "white" }}>{activo ? "5" : "—"}</p>
          <Progreso pct={50} color="#5EA1DD" delay={400} />
          <div style={{ marginTop: "5px" }}><Badge color="blue">T.1.2 + F.7</Badge></div>
        </div>

        <div style={C.card}>
          <span style={C.label}>FUTIC estimado</span>
          <p style={{ fontSize: "16px", fontWeight: "500", color: "white" }}>${futic.toLocaleString("es-CO")}</p>
          <p style={{ fontSize: "10px", color: "rgba(147,197,253,0.35)", marginTop: "4px" }}>Jun 2026</p>
        </div>
      </div>

      {/* ── Fila 2: Obligaciones | Calendario | Cumplimiento+Acciones ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 180px", gap: "10px" }}>

        {/* Obligaciones */}
        <div style={C.card}>
          <span style={C.label}>Obligaciones regulatorias</span>

          <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.04)", borderRadius: "7px", padding: "2px", marginBottom: "8px" }}>
            {["pendientes", "completadas"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "4px", border: tab === t ? "0.5px solid rgba(56,136,211,0.35)" : "0.5px solid transparent", borderRadius: "5px", fontSize: "10px", fontWeight: "500", cursor: "pointer", background: tab === t ? "rgba(24,95,165,0.35)" : "transparent", color: tab === t ? "white" : "rgba(147,197,253,0.5)", transition: "all 0.15s" }}>
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

        {/* Cumplimiento + Acciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={C.card}>
            <span style={C.label}>Cumplimiento 2026</span>
            <Dona />
          </div>
          <div style={C.card}>
            <span style={C.label}>Acciones rápidas</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Accion ic="📋" label="Nuevo T.1.2" to="/portal/reportes/t12" />
              <Accion ic="📺" label="Nuevo F.7" to="/portal/reportes/f7" />
              <Accion ic="📅" label="Calendario" to="/portal/calendario" />
              <Accion ic="📁" label="Historial" to="/portal/empresa" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Fila 3: Gráfica | Actividad ── */}
      {/* ── Fila 3: Gráfica | Actividad ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "10px" }}>

        <div style={C.card}>
          <span style={C.label}>Ingresos ISP vs FUTIC por trimestre</span>
          <Grafica />
        </div>

        <div style={C.card}>
          <span style={C.label}>Actividad reciente</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ACTIVIDAD.map((a, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "8px",
                padding: "8px 0",
                borderBottom: i < ACTIVIDAD.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: a.bg,
                  color: a.c,
                  fontSize: "12px",
                  flexShrink: 0,
                }}>
                  {a.ic}
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>
                    {a.t}
                  </p>
                  <p style={{ fontSize: "9px", color: "rgba(147,197,253,0.35)", marginTop: "2px" }}>
                    {a.s}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", marginTop: "8px", paddingTop: "8px" }}>
            <span style={C.label}>Resumen trimestral</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { label: "FUTIC total 2026", valor: "$796K", color: "#5EA1DD" },
                { label: "TV compensación", valor: "$360K", color: "#93c5fd" },
                { label: "Reportes CRC", valor: "2", color: "#34d399" },
                { label: "Reportes MinTIC", valor: "2", color: "#34d399" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "7px", padding: "6px 8px" }}>
                  <p style={{ fontSize: "9px", color: "rgba(147,197,253,0.4)", marginBottom: "3px" }}>{s.label}</p>
                  <p style={{ fontSize: "13px", fontWeight: "500", color: s.color }}>{s.valor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 