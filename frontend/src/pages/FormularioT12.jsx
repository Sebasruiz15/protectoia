// archivo: src/pages/FormularioT12.jsx
import { useState } from "react";
import * as XLSX from "xlsx-js-style";
import { api } from "@/services/api";

const TRIMESTRES = ["1T", "2T", "3T", "4T"];

const TECNOLOGIAS = [
  "GPON", "FTTH", "HFC", "DOCSIS 3.0", "DOCSIS 3.1",
  "xDSL", "Wimax", "Satelital", "Radio enlace", "Otra",
];

const SEGMENTOS = ["Residencial", "Corporativo"];
const CLASES    = ["Urbano", "Rural", "Centro Poblado"];

const TIPOLOGIAS_PQR = [
  { codigo: "C1", desc: "Facturación incorrecta"           },
  { codigo: "C2", desc: "Suspensión injustificada"         },
  { codigo: "C3", desc: "Falla en la prestación"           },
  { codigo: "C4", desc: "Velocidad inferior a la ofrecida" },
  { codigo: "C5", desc: "Incumplimiento contractual"       },
  { codigo: "C6", desc: "Cobro indebido"                   },
  { codigo: "C7", desc: "Atención al usuario deficiente"   },
  { codigo: "C8", desc: "Portabilidad"                     },
  { codigo: "C9", desc: "Otras quejas"                     },
  { codigo: "E1", desc: "Solicitud de información"         },
  { codigo: "E2", desc: "Solicitud de servicio"            },
  { codigo: "E3", desc: "Solicitud de factura"             },
];

const PASOS = [
  { id: 1, label: "Período"  },
  { id: 2, label: "Planes"   },
  { id: 3, label: "PQR"      },
  { id: 4, label: "Revisión" },
];

const MESES_POR_TRIMESTRE = {
  "1T": ["Enero",   "Febrero",   "Marzo"     ],
  "2T": ["Abril",   "Mayo",      "Junio"     ],
  "3T": ["Julio",   "Agosto",    "Septiembre"],
  "4T": ["Octubre", "Noviembre", "Diciembre" ],
};

const S = {
  card: {
    background:   "var(--bg-card)",
    border:       "1px solid var(--border-card)",
    borderRadius: "12px",
    padding:      "20px 24px",
  },
  label: {
    display:       "block",
    fontSize:      "10px",
    fontWeight:    "600",
    letterSpacing: "0.08em",
    color:         "var(--text-muted)",
    marginBottom:  "6px",
    textTransform: "uppercase",
  },
  input: {
    background:   "var(--bg-input)",
    border:       "1px solid var(--border-input)",
    borderRadius: "8px",
    color:        "var(--text-primary)",
    fontSize:     "13px",
    padding:      "8px 12px",
    width:        "100%",
    outline:      "none",
    transition:   "border-color 0.2s",
  },
  select: {
    background:   "var(--bg-input)",
    border:       "1px solid var(--border-input)",
    borderRadius: "8px",
    color:        "var(--text-primary)",
    fontSize:     "13px",
    padding:      "8px 12px",
    width:        "100%",
    outline:      "none",
    cursor:       "pointer",
  },
  sectionTitle: {
    fontSize:      "11px",
    fontWeight:    "600",
    letterSpacing: "0.08em",
    color:         "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom:  "14px",
    paddingBottom: "8px",
    borderBottom:  "1px solid var(--border-card)",
  },
  btnPrimary: {
    background:   "#185FA5",
    border:       "none",
    borderRadius: "9px",
    color:        "white",
    fontSize:     "13px",
    fontWeight:   "500",
    padding:      "10px 20px",
    cursor:       "pointer",
    transition:   "background 0.2s",
    display:      "flex",
    alignItems:   "center",
    gap:          "6px",
  },
  btnSecondary: {
    background:   "var(--bg-input)",
    border:       "1px solid var(--border-input)",
    borderRadius: "9px",
    color:        "var(--text-secondary)",
    fontSize:     "13px",
    fontWeight:   "500",
    padding:      "10px 20px",
    cursor:       "pointer",
    transition:   "background 0.2s",
  },
};

const planVacio = () => ({
  id:           Date.now() + Math.random(),
  municipio:    "",
  departamento: "",
  clase:        "Urbano",
  segmento:     "Residencial",
  tecnologia:   "GPON",
  vel_bajada:   "",
  vel_subida:   "",
  valor_plan:   "",
  accesos:      "",
});

const pqrVacio = (mes) => ({
  mes,
  filas: TIPOLOGIAS_PQR.map((t) => ({
    codigo:     t.codigo,
    desc:       t.desc,
    total:      "",
    a_favor:    "",
    en_contra:  "",
    reposicion: "",
    apelacion:  "",
  })),
});

function Campo({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function InputText({ value, onChange, placeholder = "", disabled = false }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...S.input, ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
      onFocus={(e) => { if (!disabled) e.target.style.borderColor = "rgba(56,136,211,0.6)"; }}
      onBlur={(e)  => { if (!disabled) e.target.style.borderColor = "var(--border-input)"; }}
    />
  );
}

function InputNum({ value, onChange, placeholder = "0" }) {
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={S.input}
      onFocus={(e) => (e.target.style.borderColor = "rgba(56,136,211,0.6)")}
      onBlur={(e)  => (e.target.style.borderColor = "var(--border-input)")}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={S.select}
      onFocus={(e) => (e.target.style.borderColor = "rgba(56,136,211,0.6)")}
      onBlur={(e)  => (e.target.style.borderColor = "var(--border-input)")}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "var(--bg-base)" }}>{o}</option>
      ))}
    </select>
  );
}

function IndicadorPasos({ actual }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
      {PASOS.map((p, i) => {
        const completado = actual > p.id;
        const activo     = actual === p.id;
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", flex: i < PASOS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "600", flexShrink: 0,
                background: completado ? "#0F6E56" : activo ? "#185FA5" : "rgba(255,255,255,0.06)",
                border: completado ? "1px solid rgba(15,110,86,0.5)" : activo ? "1px solid rgba(24,95,165,0.6)" : "1px solid var(--border-card)",
                color: completado || activo ? "white" : "var(--text-muted)",
                transition: "all 0.3s",
              }}>
                {completado ? "✓" : p.id}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: "500", whiteSpace: "nowrap",
                color: completado ? "#34d399" : activo ? "var(--text-primary)" : "var(--text-muted)",
              }}>
                {p.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 8px", marginBottom: "16px",
                background: completado ? "rgba(52,211,153,0.4)" : "var(--border-card)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PasoPeriodo({ datos, onChange }) {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Identificación del reporte</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
        <Campo label="Operador">
          <InputText value={empresa.razon_social ?? "—"} onChange={() => {}} disabled />
        </Campo>
        <Campo label="NIT">
          <InputText value={empresa.nit ?? "—"} onChange={() => {}} disabled />
        </Campo>
        <Campo label="Tipo de operador">
          <InputText value={empresa.tipo_isp ?? "—"} onChange={() => {}} disabled />
        </Campo>
        <Campo label="Año de reporte">
          <Select value={datos.anio} onChange={(v) => onChange("anio", v)} options={["2024","2025","2026"]} />
        </Campo>
        <Campo label="Trimestre">
          <Select value={datos.trimestre} onChange={(v) => onChange("trimestre", v)} options={TRIMESTRES} />
        </Campo>
        <Campo label="Municipio principal">
          <InputText value={datos.municipio} onChange={(v) => onChange("municipio", v)} placeholder="Ej: Amagá, Antioquia" />
        </Campo>
      </div>
      <div style={{ marginTop: "20px", padding: "12px 16px", borderRadius: "10px", background: "rgba(24,95,165,0.1)", border: "1px solid rgba(56,136,211,0.2)" }}>
        <p style={{ fontSize: "11px", fontWeight: "500", marginBottom: "4px", color: "var(--text-info-title)" }}>
          📋 Formato T.1.2 — Resolución CRC 7811
        </p>
        <p style={{ fontSize: "11px", lineHeight: "1.6", color: "var(--text-info-body)" }}>
          Aplica a proveedores de internet fijo residencial con menos de 30.000 accesos.
          Plazo: <strong style={{ color: "var(--text-primary)" }}>45 días calendario</strong> post-trimestre
          a través de <strong style={{ color: "var(--text-primary)" }}>HECAA</strong>.
        </p>
      </div>
    </div>
  );
}

function PasoPlanes({ planes, onChange }) {
  const actualizar = (id, campo, valor) =>
    onChange(planes.map((p) => p.id === id ? { ...p, [campo]: valor } : p));
  const agregar  = () => onChange([...planes, planVacio()]);
  const eliminar = (id) => { if (planes.length > 1) onChange(planes.filter((p) => p.id !== id)); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ ...S.card, padding: "12px 16px", background: "rgba(24,95,165,0.08)", border: "1px solid rgba(56,136,211,0.15)" }}>
        <p style={{ fontSize: "11px", color: "var(--text-info-body)", lineHeight: "1.6" }}>
          Registra cada plan comercial que ofreciste durante el trimestre. Si tienes el mismo plan en varios municipios, agrega una fila por cada municipio.
        </p>
      </div>

      {planes.map((plan, idx) => (
        <div key={plan.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)" }}>Plan #{idx + 1}</p>
            <button
              onClick={() => eliminar(plan.id)}
              disabled={planes.length === 1}
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "7px", color: "#f87171", fontSize: "11px", padding: "4px 10px", cursor: planes.length === 1 ? "not-allowed" : "pointer", opacity: planes.length === 1 ? 0.4 : 1 }}
            >
              Eliminar
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <Campo label="Municipio">
              <InputText value={plan.municipio}    onChange={(v) => actualizar(plan.id, "municipio",    v)} placeholder="Ej: Amagá" />
            </Campo>
            <Campo label="Departamento">
              <InputText value={plan.departamento} onChange={(v) => actualizar(plan.id, "departamento", v)} placeholder="Ej: Antioquia" />
            </Campo>
            <Campo label="Clase">
              <Select value={plan.clase} onChange={(v) => actualizar(plan.id, "clase", v)} options={CLASES} />
            </Campo>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <Campo label="Segmento">
              <Select value={plan.segmento}   onChange={(v) => actualizar(plan.id, "segmento",   v)} options={SEGMENTOS} />
            </Campo>
            <Campo label="Tecnología">
              <Select value={plan.tecnologia} onChange={(v) => actualizar(plan.id, "tecnologia", v)} options={TECNOLOGIAS} />
            </Campo>
            <Campo label="Bajada (Mbps)">
              <InputNum value={plan.vel_bajada} onChange={(v) => actualizar(plan.id, "vel_bajada", v)} placeholder="100" />
            </Campo>
            <Campo label="Subida (Mbps)">
              <InputNum value={plan.vel_subida} onChange={(v) => actualizar(plan.id, "vel_subida", v)} placeholder="20" />
            </Campo>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Campo label="Valor del plan sin IVA ($)">
              <InputNum value={plan.valor_plan} onChange={(v) => actualizar(plan.id, "valor_plan", v)} placeholder="49900" />
            </Campo>
            <Campo label="Accesos activos al cierre">
              <InputNum value={plan.accesos} onChange={(v) => actualizar(plan.id, "accesos", v)} placeholder="150" />
            </Campo>
          </div>
        </div>
      ))}

      <button
        onClick={agregar}
        style={{ ...S.btnSecondary, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", borderStyle: "dashed" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(56,136,211,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-input)")}
      >
        + Agregar otro plan
      </button>
    </div>
  );
}

function PasoPQR({ pqr, onChange }) {
  const [mesActivo, setMesActivo] = useState(0);

  const actualizar = (mesIdx, filaIdx, campo, valor) =>
    onChange(pqr.map((m, mi) => mi !== mesIdx ? m : {
      ...m,
      filas: m.filas.map((f, fi) => fi !== filaIdx ? f : { ...f, [campo]: valor }),
    }));

  const thS = { padding: "8px 10px", fontSize: "9px", fontWeight: "600", letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid var(--border-card)", whiteSpace: "nowrap" };
  const tdS = { padding: "6px 8px", borderBottom: "1px solid var(--border-card)" };
  const inpS = { background: "var(--bg-input)", border: "1px solid var(--border-input)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "12px", padding: "5px 8px", width: "70px", outline: "none", textAlign: "center" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ ...S.card, padding: "12px 16px", background: "rgba(24,95,165,0.08)", border: "1px solid rgba(56,136,211,0.15)" }}>
        <p style={{ fontSize: "11px", color: "var(--text-info-body)", lineHeight: "1.6" }}>
          Registra las PQR recibidas por tipología en cada mes del trimestre.
        </p>
      </div>

      <div style={{ display: "flex", gap: "2px", background: "var(--bg-input)", borderRadius: "9px", padding: "3px" }}>
        {pqr.map((m, i) => (
          <button key={i} onClick={() => setMesActivo(i)} style={{
            flex: 1, padding: "7px", borderRadius: "7px", fontSize: "12px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s",
            border:     mesActivo === i ? "0.5px solid rgba(56,136,211,0.35)" : "0.5px solid transparent",
            background: mesActivo === i ? "rgba(24,95,165,0.35)" : "transparent",
            color:      mesActivo === i ? "white" : "var(--text-muted)",
          }}>
            {m.mes}
          </button>
        ))}
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thS, width: "50px" }}>Código</th>
                <th style={{ ...thS, minWidth: "180px" }}>Tipología</th>
                {["Total PQR","A favor usuario","A favor operador","Reposición","Apelación"].map((h) => (
                  <th key={h} style={{ ...thS, textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pqr[mesActivo].filas.map((fila, fi) => (
                <tr key={fila.codigo}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdS}>
                    <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "20px", background: "rgba(56,136,211,0.15)", color: "#93c5fd", border: "0.5px solid rgba(56,136,211,0.25)" }}>
                      {fila.codigo}
                    </span>
                  </td>
                  <td style={{ ...tdS, fontSize: "11px", color: "var(--text-secondary)" }}>{fila.desc}</td>
                  {["total","a_favor","en_contra","reposicion","apelacion"].map((campo) => (
                    <td key={campo} style={{ ...tdS, textAlign: "center" }}>
                      <input
                        type="number" min="0"
                        value={fila[campo]}
                        onChange={(e) => actualizar(mesActivo, fi, campo, e.target.value)}
                        style={inpS}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(56,136,211,0.5)")}
                        onBlur={(e)  => (e.target.style.borderColor = "var(--border-input)")}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-input)" }}>
                <td colSpan={2} style={{ ...tdS, fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>TOTALES</td>
                {["total","a_favor","en_contra","reposicion","apelacion"].map((campo) => (
                  <td key={campo} style={{ ...tdS, textAlign: "center", fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {pqr[mesActivo].filas.reduce((acc, f) => acc + (parseInt(f[campo]) || 0), 0)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function PasoRevision({ periodo, planes, pqr }) {
  const empresa      = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const totalAccesos = planes.reduce((a, p) => a + (parseInt(p.accesos) || 0), 0);
  const totalPQR     = pqr.reduce((t, m) => t + m.filas.reduce((tt, f) => tt + (parseInt(f.total) || 0), 0), 0);

  const Item = ({ label, valor, ok }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid var(--border-card)" }}>
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>{valor}</span>
        {ok !== undefined && <span style={{ fontSize: "10px", color: ok ? "#34d399" : "#f87171" }}>{ok ? "✓" : "⚠"}</span>}
      </div>
    </div>
  );

  const validaciones = [
    { label: "Período definido",    ok: !!periodo.anio && !!periodo.trimestre },
    { label: "Municipio ingresado", ok: !!periodo.municipio },
    { label: "Planes completos",    ok: planes.every((p) => p.municipio && p.accesos && p.vel_bajada) },
    { label: "Accesos > 0",         ok: totalAccesos > 0 },
    { label: "Formato T.1.2",       ok: true },
    { label: "Listo para HECAA",    ok: totalAccesos > 0 && !!periodo.municipio },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <div style={S.card}>
        <p style={S.sectionTitle}>Resumen del reporte</p>
        <Item label="Operador"           valor={empresa.razon_social}                     ok={true} />
        <Item label="NIT"                valor={empresa.nit}                              ok={true} />
        <Item label="Período"            valor={`${periodo.trimestre} — ${periodo.anio}`} ok={true} />
        <Item label="Municipio"          valor={periodo.municipio || "Sin definir"}        ok={!!periodo.municipio} />
        <Item label="Planes registrados" valor={planes.length}                            ok={planes.length > 0} />
        <Item label="Total accesos"      valor={totalAccesos.toLocaleString("es-CO")}     ok={totalAccesos > 0} />
        <Item label="Total PQR"          valor={totalPQR}                                 ok={true} />
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Detalle de planes</p>
        {planes.map((p, i) => (
          <div key={p.id} style={{ padding: "8px 10px", borderRadius: "8px", background: "var(--bg-input)", marginBottom: "6px" }}>
            <p style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>
              Plan #{i + 1} — {p.municipio || "Sin municipio"} · {p.tecnologia}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[`↓ ${p.vel_bajada || "—"} Mbps`, `↑ ${p.vel_subida || "—"} Mbps`, `$${parseInt(p.valor_plan || 0).toLocaleString("es-CO")}`, `${p.accesos || "—"} accesos`].map((d) => (
                <span key={d} style={{ fontSize: "10px", color: "var(--text-muted)" }}>{d}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, gridColumn: "span 2", background: "rgba(24,95,165,0.08)", border: "1px solid rgba(56,136,211,0.2)" }}>
        <p style={{ ...S.sectionTitle, color: "#93c5fd" }}>Validación antes de generar</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
          {validaciones.map((v) => (
            <div key={v.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: v.ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)", border: `0.5px solid ${v.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
              <span style={{ fontSize: "14px" }}>{v.ok ? "✓" : "⚠"}</span>
              <span style={{ fontSize: "11px", color: v.ok ? "#34d399" : "#f87171" }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function FormularioT12() {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const [paso,    setPaso]    = useState(1);
  const [periodo, setPeriodo] = useState({ anio: "2026", trimestre: "2T", municipio: empresa.municipio ?? "" });
  const [planes,  setPlanes]  = useState([planVacio()]);
  const [pqr,          setPQR]         = useState(MESES_POR_TRIMESTRE["2T"].map((mes) => pqrVacio(mes)));
  const [cargando,     setCargando]     = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const [exitoVisible, setExitoVisible] = useState(false);

  const handlePeriodoChange = (campo, valor) => {
    setPeriodo((prev) => {
      const nuevo = { ...prev, [campo]: valor };
      if (campo === "trimestre") setPQR(MESES_POR_TRIMESTRE[valor].map((mes) => pqrVacio(mes)));
      return nuevo;
    });
  };

  const puedeAvanzar = () => {
    if (paso === 1) return !!periodo.anio && !!periodo.trimestre;
    if (paso === 2) return planes.length > 0;
    return true;
  };

  // ── Generación del Excel ──────────────────────────────────────
  const generarReporte = async () => {
  setCargando(true);
  setErrorGuardar("");
  setExitoVisible(false);

  try {
    // ── 1. Guardar en base de datos ───────────────────────────
    await api.post("/reportes/t12", {
      anio:         periodo.anio,
      trimestre:    periodo.trimestre,
      municipio:    periodo.municipio,
      datos_planes: planes,
      datos_pqr:    pqr,
    });

    // ── 2. Estilos reutilizables ──────────────────────────────
    const AZUL_OSCURO  = "0C2340";
    const AZUL_MEDIO   = "185FA5";
    const AZUL_CLARO   = "E6F1FB";
    const VERDE        = "0F6E56";
    const BLANCO       = "FFFFFF";
    const GRIS_CLARO   = "F4F8FC";
    const GRIS_TEXTO   = "64748B";

    const sTitulo = {
      font:      { bold: true, sz: 14, color: { rgb: BLANCO } },
      fill:      { fgColor: { rgb: AZUL_OSCURO } },
      alignment: { horizontal: "left", vertical: "center" },
    };
    const sSubtitulo = {
      font:      { bold: false, sz: 10, color: { rgb: BLANCO } },
      fill:      { fgColor: { rgb: AZUL_MEDIO } },
      alignment: { horizontal: "left", vertical: "center" },
    };
    const sEncabezado = {
      font:      { bold: true, sz: 10, color: { rgb: BLANCO } },
      fill:      { fgColor: { rgb: AZUL_MEDIO } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top:    { style: "thin", color: { rgb: BLANCO } },
        bottom: { style: "thin", color: { rgb: BLANCO } },
        left:   { style: "thin", color: { rgb: BLANCO } },
        right:  { style: "thin", color: { rgb: BLANCO } },
      },
    };
    const sLabel = {
      font:      { bold: true, sz: 10, color: { rgb: AZUL_OSCURO } },
      fill:      { fgColor: { rgb: AZUL_CLARO } },
      alignment: { horizontal: "left", vertical: "center" },
      border:    { bottom: { style: "thin", color: { rgb: "DDDDDD" } } },
    };
    const sValor = {
      font:      { sz: 10, color: { rgb: "1A1A1A" } },
      alignment: { horizontal: "left", vertical: "center" },
      border:    { bottom: { style: "thin", color: { rgb: "DDDDDD" } } },
    };
    const sDatoNormal = {
      font:      { sz: 10 },
      fill:      { fgColor: { rgb: BLANCO } },
      alignment: { horizontal: "left", vertical: "center" },
      border:    { bottom: { style: "thin", color: { rgb: "EEEEEE" } }, right: { style: "thin", color: { rgb: "EEEEEE" } } },
    };
    const sDatoAlterno = {
      ...sDatoNormal,
      fill: { fgColor: { rgb: GRIS_CLARO } },
    };
    const sNumero = (alterno = false) => ({
      font:      { sz: 10 },
      fill:      { fgColor: { rgb: alterno ? GRIS_CLARO : BLANCO } },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt:    "#,##0",
      border:    { bottom: { style: "thin", color: { rgb: "EEEEEE" } }, right: { style: "thin", color: { rgb: "EEEEEE" } } },
    });
    const sTotal = {
      font:      { bold: true, sz: 10, color: { rgb: BLANCO } },
      fill:      { fgColor: { rgb: AZUL_OSCURO } },
      alignment: { horizontal: "center", vertical: "center" },
    };
    const sSubtotal = {
      font:      { bold: true, sz: 10, color: { rgb: AZUL_OSCURO } },
      fill:      { fgColor: { rgb: AZUL_CLARO } },
      alignment: { horizontal: "center", vertical: "center" },
      border:    { bottom: { style: "medium", color: { rgb: AZUL_MEDIO } } },
    };
    const sSectionTitle = {
      font:      { bold: true, sz: 11, color: { rgb: AZUL_OSCURO } },
      fill:      { fgColor: { rgb: AZUL_CLARO } },
      alignment: { horizontal: "left", vertical: "center" },
      border:    { left: { style: "medium", color: { rgb: AZUL_MEDIO } } },
    };

    const wb = XLSX.utils.book_new();

    // ── Hoja 1: Identificación ────────────────────────────────
    const infoData = [
      ["FORMATO T.1.2 — FORMATO UNIFICADO ISP", ""],
      ["Resolución CRC 7811 · Reporte de información sectorial", ""],
      ["", ""],
      ["DATOS DEL OPERADOR", ""],
      ["Operador",          empresa.razon_social ?? ""],
      ["NIT",               empresa.nit           ?? ""],
      ["Tipo de ISP",       empresa.tipo_isp      ?? ""],
      ["", ""],
      ["PERÍODO DE REPORTE", ""],
      ["Año",               periodo.anio],
      ["Trimestre",         periodo.trimestre],
      ["Municipio",         periodo.municipio],
      ["", ""],
      ["GENERACIÓN", ""],
      ["Fecha generación",  new Date().toLocaleDateString("es-CO")],
      ["Generado por",      "Gesco IA · Compliance TIC"],
    ];

    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    wsInfo["!cols"] = [{ wch: 22 }, { wch: 45 }];
    wsInfo["!rows"] = [{ hpt: 28 }, { hpt: 18 }];
    wsInfo["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } },
      { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } },
    ];

    // Aplicar estilos hoja info
    wsInfo["A1"].s = sTitulo;   wsInfo["B1"].s = sTitulo;
    wsInfo["A2"].s = sSubtitulo; wsInfo["B2"].s = sSubtitulo;
    wsInfo["A4"].s = sSectionTitle; wsInfo["B4"].s = sSectionTitle;
    wsInfo["A9"].s = sSectionTitle; wsInfo["B9"].s = sSectionTitle;
    wsInfo["A14"].s = sSectionTitle; wsInfo["B14"].s = sSectionTitle;
    ["A5","A6","A7","A10","A11","A12","A15","A16"].forEach(c => { if(wsInfo[c]) wsInfo[c].s = sLabel; });
    ["B5","B6","B7","B10","B11","B12","B15","B16"].forEach(c => { if(wsInfo[c]) wsInfo[c].s = sValor; });

    XLSX.utils.book_append_sheet(wb, wsInfo, "Identificación");

    // ── Hoja 2: Planes ISP ────────────────────────────────────
    const cabPlanes = [
      "Municipio","Departamento","Clase","Segmento","Tecnología",
      "Vel. Bajada (Mbps)","Vel. Subida (Mbps)",
      "Valor Plan sin IVA ($)","Accesos Activos",
    ];

    const filasPlanes = planes.map((p) => [
      p.municipio, p.departamento, p.clase, p.segmento, p.tecnologia,
      parseFloat(p.vel_bajada) || 0,
      parseFloat(p.vel_subida) || 0,
      parseFloat(p.valor_plan) || 0,
      parseInt(p.accesos)      || 0,
    ]);

    const totalAccesos = planes.reduce((a, p) => a + (parseInt(p.accesos) || 0), 0);
    const totalValor   = planes.reduce((a, p) => a + (parseFloat(p.valor_plan) || 0), 0);

    const wsPlanes = XLSX.utils.aoa_to_sheet([
      cabPlanes,
      ...filasPlanes,
      ["TOTALES","","","","","","",totalValor, totalAccesos],
    ]);

    wsPlanes["!cols"] = [
      {wch:18},{wch:16},{wch:14},{wch:14},{wch:14},
      {wch:18},{wch:18},{wch:22},{wch:16},
    ];
    wsPlanes["!rows"] = [{ hpt: 36 }];

    // Estilos encabezados
    "ABCDEFGHI".split("").forEach(col => {
      const cell = `${col}1`;
      if (wsPlanes[cell]) wsPlanes[cell].s = sEncabezado;
    });

    // Estilos filas datos
    filasPlanes.forEach((_, i) => {
      const fila   = i + 2;
      const alterno = i % 2 !== 0;
      ["A","B","C","D","E"].forEach(col => {
        const c = `${col}${fila}`;
        if (wsPlanes[c]) wsPlanes[c].s = alterno ? sDatoAlterno : sDatoNormal;
      });
      ["F","G","H","I"].forEach(col => {
        const c = `${col}${fila}`;
        if (wsPlanes[c]) wsPlanes[c].s = sNumero(alterno);
      });
    });

    // Fila totales
    const filaTotal = filasPlanes.length + 2;
    "ABCDEFGHI".split("").forEach(col => {
      const c = `${col}${filaTotal}`;
      if (wsPlanes[c]) wsPlanes[c].s = sTotal;
    });

    XLSX.utils.book_append_sheet(wb, wsPlanes, "Planes ISP");

    // ── Hoja 3: PQR ───────────────────────────────────────────
    const cabPQR = [
      "Mes","Código","Tipología","Total PQR",
      "A favor usuario","A favor operador","Reposición","Apelación",
    ];

    const filasPQR = [];
    const coloresMes = [BLANCO, GRIS_CLARO, "EDF4FF"];

    pqr.forEach((mes, mi) => {
      mes.filas.forEach((fila) => {
        filasPQR.push([
          mes.mes, fila.codigo, fila.desc,
          parseInt(fila.total)      || 0,
          parseInt(fila.a_favor)    || 0,
          parseInt(fila.en_contra)  || 0,
          parseInt(fila.reposicion) || 0,
          parseInt(fila.apelacion)  || 0,
          mi, // índice color (se eliminará)
        ]);
      });
      filasPQR.push([
        `TOTAL ${mes.mes.toUpperCase()}`, "", "",
        mes.filas.reduce((a, f) => a + (parseInt(f.total)      || 0), 0),
        mes.filas.reduce((a, f) => a + (parseInt(f.a_favor)    || 0), 0),
        mes.filas.reduce((a, f) => a + (parseInt(f.en_contra)  || 0), 0),
        mes.filas.reduce((a, f) => a + (parseInt(f.reposicion) || 0), 0),
        mes.filas.reduce((a, f) => a + (parseInt(f.apelacion)  || 0), 0),
        -1, // marca de subtotal
      ]);
    });

    // Extraer índice de color y crear hoja
    const filasPQRLimpias = filasPQR.map(f => f.slice(0, 8));
    const wsPQR = XLSX.utils.aoa_to_sheet([cabPQR, ...filasPQRLimpias]);

    wsPQR["!cols"] = [
      {wch:14},{wch:8},{wch:32},{wch:12},
      {wch:16},{wch:16},{wch:12},{wch:12},
    ];
    wsPQR["!rows"] = [{ hpt: 36 }];

    // Estilos encabezados PQR
    "ABCDEFGH".split("").forEach(col => {
      const c = `${col}1`;
      if (wsPQR[c]) wsPQR[c].s = sEncabezado;
    });

    // Estilos filas PQR
    filasPQR.forEach((fila, i) => {
      const rowIdx  = i + 2;
      const colorIdx = fila[8];
      const esSubtotal = colorIdx === -1;
      const colorBase  = coloresMes[colorIdx % coloresMes.length] ?? BLANCO;

      "ABCDEFGH".split("").forEach((col, ci) => {
        const c = `${col}${rowIdx}`;
        if (!wsPQR[c]) return;

        if (esSubtotal) {
          wsPQR[c].s = sSubtotal;
        } else if (ci < 3) {
          wsPQR[c].s = {
            ...sDatoNormal,
            fill: { fgColor: { rgb: colorBase } },
          };
        } else {
          wsPQR[c].s = {
            ...sNumero(false),
            fill: { fgColor: { rgb: colorBase } },
          };
        }
      });
    });

    XLSX.utils.book_append_sheet(wb, wsPQR, "PQR");

    // ── Descargar ─────────────────────────────────────────────
    const nit    = (empresa.nit ?? "SIN_NIT").replace(/[^0-9]/g, "");
    const nombre = `T1_2_${nit}_${periodo.trimestre}_${periodo.anio}.xlsx`;
    XLSX.writeFile(wb, nombre);

    setExitoVisible(true);

  } catch (err) {
    console.error(err);
    setErrorGuardar(err.mensaje ?? "Error al guardar el reporte. Intenta de nuevo.");
  } finally {
    setCargando(false);
  }
};



  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1100px" }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "17px", fontWeight: "500", color: "var(--text-primary)" }}>
            Formato T.1.2 — Formato Unificado ISP
          </h1>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
            Resolución CRC 7811 · Reporte trimestral ante HECAA
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "rgba(56,136,211,0.15)", border: "0.5px solid rgba(56,136,211,0.3)", color: "#93c5fd" }}>
            CRC · HECAA
          </span>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "rgba(251,191,36,0.12)", border: "0.5px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
            Vence 45 días post-trimestre
          </span>
        </div>
      </div>

      <IndicadorPasos actual={paso} />

      {paso === 1 && <PasoPeriodo  datos={periodo} onChange={handlePeriodoChange} />}
      {paso === 2 && <PasoPlanes   planes={planes} onChange={setPlanes} />}
      {paso === 3 && <PasoPQR      pqr={pqr}       onChange={setPQR} />}
      {paso === 4 && <PasoRevision periodo={periodo} planes={planes} pqr={pqr} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
        <button
          onClick={() => setPaso((p) => Math.max(1, p - 1))}
          disabled={paso === 1}
          style={{ ...S.btnSecondary, opacity: paso === 1 ? 0.4 : 1, cursor: paso === 1 ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (paso > 1) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-input)"; }}
        >
          ← Anterior
        </button>

        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Paso {paso} de {PASOS.length}
        </span>

        {paso < 4 ? (
          <button
            onClick={() => { if (puedeAvanzar()) setPaso((p) => p + 1); }}
            disabled={!puedeAvanzar()}
            style={{ ...S.btnPrimary, opacity: puedeAvanzar() ? 1 : 0.5, cursor: puedeAvanzar() ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (puedeAvanzar()) e.currentTarget.style.background = "#0C447C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#185FA5"; }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={generarReporte}
            style={{ ...S.btnPrimary, background: "#0F6E56" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#085041")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0F6E56")}
          >
            📥 Generar T.1.2
          </button>
        )}
      </div>
    </div>
  );
}