// archivo: src/pages/FormularioT12.jsx
import { useState } from "react";

// ── Constantes ────────────────────────────────────────────────────
const TRIMESTRES = ["1T", "2T", "3T", "4T"];

const TECNOLOGIAS = [
  "GPON",
  "FTTH",
  "HFC",
  "DOCSIS 3.0",
  "DOCSIS 3.1",
  "xDSL",
  "Wimax",
  "Satelital",
  "Radio enlace",
  "Otra",
];

const SEGMENTOS = ["Residencial", "Corporativo"];
const CLASES = ["Urbano", "Rural", "Centro Poblado"];

const TIPOLOGIAS_PQR = [
  { codigo: "C1", desc: "Facturación incorrecta" },
  { codigo: "C2", desc: "Suspensión injustificada" },
  { codigo: "C3", desc: "Falla en la prestación" },
  { codigo: "C4", desc: "Velocidad inferior a la ofrecida" },
  { codigo: "C5", desc: "Incumplimiento contractual" },
  { codigo: "C6", desc: "Cobro indebido" },
  { codigo: "C7", desc: "Atención al usuario deficiente" },
  { codigo: "C8", desc: "Portabilidad" },
  { codigo: "C9", desc: "Otras quejas" },
  { codigo: "E1", desc: "Solicitud de información" },
  { codigo: "E2", desc: "Solicitud de servicio" },
  { codigo: "E3", desc: "Solicitud de factura" },
];

const PASOS = [
  { id: 1, label: "Período" },
  { id: 2, label: "Planes" },
  { id: 3, label: "PQR" },
  { id: 4, label: "Revisión" },
];

const MESES_POR_TRIMESTRE = {
  "1T": ["Enero", "Febrero", "Marzo"],
  "2T": ["Abril", "Mayo", "Junio"],
  "3T": ["Julio", "Agosto", "Septiembre"],
  "4T": ["Octubre", "Noviembre", "Diciembre"],
};

// ── Estilos base ──────────────────────────────────────────────────
const S = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    borderRadius: "12px",
    padding: "20px 24px",
  },
  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    background: "var(--bg-input)",
    border: "1px solid var(--border-input)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  },
  select: {
    background: "var(--bg-input)",
    border: "1px solid var(--border-input)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
    cursor: "pointer",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: "14px",
    paddingBottom: "8px",
    borderBottom: "1px solid var(--border-card)",
  },
  btnPrimary: {
    background: "#185FA5",
    border: "none",
    borderRadius: "9px",
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
    padding: "10px 20px",
    cursor: "pointer",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnSecondary: {
    background: "var(--bg-input)",
    border: "1px solid var(--border-input)",
    borderRadius: "9px",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    padding: "10px 20px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

// ── Factories ─────────────────────────────────────────────────────
const planVacio = () => ({
  id: Date.now() + Math.random(),
  municipio: "",
  departamento: "",
  clase: "Urbano",
  segmento: "Residencial",
  tecnologia: "GPON",
  vel_bajada: "",
  vel_subida: "",
  valor_plan: "",
  accesos: "",
});

const pqrVacio = (mes) => ({
  mes,
  filas: TIPOLOGIAS_PQR.map((t) => ({
    codigo: t.codigo,
    desc: t.desc,
    total: "",
    a_favor: "",
    en_contra: "",
    reposicion: "",
    apelacion: "",
  })),
});

// ── Componentes primitivos ────────────────────────────────────────
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
      style={{
        ...S.input,
        ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      }}
      onFocus={(e) => {
        if (!disabled) e.target.style.borderColor = "rgba(56,136,211,0.6)";
      }}
      onBlur={(e) => {
        if (!disabled) e.target.style.borderColor = "var(--border-input)";
      }}
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
      onBlur={(e) => (e.target.style.borderColor = "var(--border-input)")}
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
      onBlur={(e) => (e.target.style.borderColor = "var(--border-input)")}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "var(--bg-base)" }}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ── Indicador de pasos ────────────────────────────────────────────
function IndicadorPasos({ actual }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
    >
      {PASOS.map((p, i) => {
        const completado = actual > p.id;
        const activo = actual === p.id;
        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < PASOS.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "600",
                  flexShrink: 0,
                  background: completado
                    ? "#0F6E56"
                    : activo
                      ? "#185FA5"
                      : "rgba(255,255,255,0.06)",
                  border: completado
                    ? "1px solid rgba(15,110,86,0.5)"
                    : activo
                      ? "1px solid rgba(24,95,165,0.6)"
                      : "1px solid var(--border-card)",
                  color: completado || activo ? "white" : "var(--text-muted)",
                  transition: "all 0.3s",
                }}
              >
                {completado ? "✓" : p.id}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "500",
                  color: completado
                    ? "#34d399"
                    : activo
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: completado
                    ? "rgba(52,211,153,0.4)"
                    : "var(--border-card)",
                  margin: "0 8px",
                  marginBottom: "16px",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Paso 1: Período ───────────────────────────────────────────────
function PasoPeriodo({ datos, onChange }) {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Identificación del reporte</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "16px",
        }}
      >
        <Campo label="Operador">
          <InputText
            value={empresa.razon_social ?? "—"}
            onChange={() => {}}
            disabled
          />
        </Campo>
        <Campo label="NIT">
          <InputText value={empresa.nit ?? "—"} onChange={() => {}} disabled />
        </Campo>
        <Campo label="Tipo de operador">
          <InputText
            value={empresa.tipo_isp ?? "—"}
            onChange={() => {}}
            disabled
          />
        </Campo>
        <Campo label="Año de reporte">
          <Select
            value={datos.anio}
            onChange={(v) => onChange("anio", v)}
            options={["2024", "2025", "2026"]}
          />
        </Campo>
        <Campo label="Trimestre">
          <Select
            value={datos.trimestre}
            onChange={(v) => onChange("trimestre", v)}
            options={TRIMESTRES}
          />
        </Campo>
        <Campo label="Municipio principal">
          <InputText
            value={datos.municipio}
            onChange={(v) => onChange("municipio", v)}
            placeholder="Ej: Amagá, Antioquia"
          />
        </Campo>
      </div>
      <div
        style={{
          marginTop: "20px",
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(24,95,165,0.1)",
          border: "1px solid rgba(56,136,211,0.2)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "500",
            marginBottom: "4px",
            color: "var(--text-info-title)",
          }}
        >
          📋 Formato T.1.2 — Resolución CRC 7811
        </p>
        <p
          style={{
            fontSize: "11px",
            lineHeight: "1.6",
            color: "var(--text-info-body)",
          }}
        >
          Aplica a proveedores de internet fijo residencial con menos de 30.000
          accesos. Plazo de entrega:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            45 días calendario
          </strong>{" "}
          post-trimestre a través de{" "}
          <strong style={{ color: "var(--text-primary)" }}>HECAA</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Paso 2: Planes ────────────────────────────────────────────────
function PasoPlanes({ planes, onChange }) {
  const actualizar = (id, campo, valor) =>
    onChange(planes.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));

  const agregar = () => onChange([...planes, planVacio()]);
  const eliminar = (id) => {
    if (planes.length > 1) onChange(planes.filter((p) => p.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          ...S.card,
          padding: "12px 16px",
          background: "rgba(24,95,165,0.08)",
          border: "1px solid rgba(56,136,211,0.15)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(147,197,253,0.7)",
            lineHeight: "1.6",
          }}
        >
          Registra cada plan comercial que ofreciste durante el trimestre. Si
          tienes el mismo plan en varios municipios, agrega una fila por cada
          municipio.
        </p>
      </div>

      {planes.map((plan, idx) => (
        <div key={plan.id} style={S.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text-secondary)",
              }}
            >
              Plan #{idx + 1}
            </p>
            <button
              onClick={() => eliminar(plan.id)}
              disabled={planes.length === 1}
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "7px",
                color: "#f87171",
                fontSize: "11px",
                padding: "4px 10px",
                cursor: planes.length === 1 ? "not-allowed" : "pointer",
                opacity: planes.length === 1 ? 0.4 : 1,
              }}
            >
              Eliminar
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Campo label="Municipio">
              <InputText
                value={plan.municipio}
                onChange={(v) => actualizar(plan.id, "municipio", v)}
                placeholder="Ej: Amagá"
              />
            </Campo>
            <Campo label="Departamento">
              <InputText
                value={plan.departamento}
                onChange={(v) => actualizar(plan.id, "departamento", v)}
                placeholder="Ej: Antioquia"
              />
            </Campo>
            <Campo label="Clase">
              <Select
                value={plan.clase}
                onChange={(v) => actualizar(plan.id, "clase", v)}
                options={CLASES}
              />
            </Campo>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Campo label="Segmento">
              <Select
                value={plan.segmento}
                onChange={(v) => actualizar(plan.id, "segmento", v)}
                options={SEGMENTOS}
              />
            </Campo>
            <Campo label="Tecnología">
              <Select
                value={plan.tecnologia}
                onChange={(v) => actualizar(plan.id, "tecnologia", v)}
                options={TECNOLOGIAS}
              />
            </Campo>
            <Campo label="Bajada (Mbps)">
              <InputNum
                value={plan.vel_bajada}
                onChange={(v) => actualizar(plan.id, "vel_bajada", v)}
                placeholder="100"
              />
            </Campo>
            <Campo label="Subida (Mbps)">
              <InputNum
                value={plan.vel_subida}
                onChange={(v) => actualizar(plan.id, "vel_subida", v)}
                placeholder="20"
              />
            </Campo>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Campo label="Valor del plan sin IVA ($)">
              <InputNum
                value={plan.valor_plan}
                onChange={(v) => actualizar(plan.id, "valor_plan", v)}
                placeholder="49900"
              />
            </Campo>
            <Campo label="Accesos activos al cierre">
              <InputNum
                value={plan.accesos}
                onChange={(v) => actualizar(plan.id, "accesos", v)}
                placeholder="150"
              />
            </Campo>
          </div>
        </div>
      ))}

      <button
        onClick={agregar}
        style={{
          ...S.btnSecondary,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "12px",
          borderStyle: "dashed",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(56,136,211,0.1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--bg-input)")
        }
      >
        + Agregar otro plan
      </button>
    </div>
  );
}

// ── Paso 3: PQR ───────────────────────────────────────────────────
function PasoPQR({ pqr, onChange }) {
  const [mesActivo, setMesActivo] = useState(0);

  const actualizar = (mesIdx, filaIdx, campo, valor) =>
    onChange(
      pqr.map((m, mi) =>
        mi !== mesIdx
          ? m
          : {
              ...m,
              filas: m.filas.map((f, fi) =>
                fi !== filaIdx ? f : { ...f, [campo]: valor },
              ),
            },
      ),
    );

  const thS = {
    padding: "8px 10px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: "1px solid var(--border-card)",
    whiteSpace: "nowrap",
  };
  const tdS = {
    padding: "6px 8px",
    borderBottom: "1px solid var(--border-card)",
  };
  const inpS = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-input)",
    borderRadius: "6px",
    color: "var(--text-primary)",
    fontSize: "12px",
    padding: "5px 8px",
    width: "70px",
    outline: "none",
    textAlign: "center",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          ...S.card,
          padding: "12px 16px",
          background: "rgba(24,95,165,0.08)",
          border: "1px solid rgba(56,136,211,0.15)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "rgba(147,197,253,0.7)",
            lineHeight: "1.6",
          }}
        >
          Registra las PQR recibidas por tipología en cada mes del trimestre.
        </p>
      </div>

      {/* Tabs meses */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          background: "var(--bg-input)",
          borderRadius: "9px",
          padding: "3px",
        }}
      >
        {pqr.map((m, i) => (
          <button
            key={i}
            onClick={() => setMesActivo(i)}
            style={{
              flex: 1,
              padding: "7px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.15s",
              border:
                mesActivo === i
                  ? "0.5px solid rgba(56,136,211,0.35)"
                  : "0.5px solid transparent",
              background:
                mesActivo === i ? "rgba(24,95,165,0.35)" : "transparent",
              color: mesActivo === i ? "white" : "var(--text-muted)",
            }}
          >
            {m.mes}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thS, width: "50px" }}>Código</th>
                <th style={{ ...thS, minWidth: "180px" }}>Tipología</th>
                {[
                  "Total PQR",
                  "A favor usuario",
                  "A favor operador",
                  "Reposición",
                  "Apelación",
                ].map((h) => (
                  <th key={h} style={{ ...thS, textAlign: "center" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pqr[mesActivo].filas.map((fila, fi) => (
                <tr
                  key={fila.codigo}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={tdS}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "2px 7px",
                        borderRadius: "20px",
                        background: "rgba(56,136,211,0.15)",
                        color: "#93c5fd",
                        border: "0.5px solid rgba(56,136,211,0.25)",
                      }}
                    >
                      {fila.codigo}
                    </span>
                  </td>
                  <td
                    style={{
                      ...tdS,
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {fila.desc}
                  </td>
                  {[
                    "total",
                    "a_favor",
                    "en_contra",
                    "reposicion",
                    "apelacion",
                  ].map((campo) => (
                    <td key={campo} style={{ ...tdS, textAlign: "center" }}>
                      <input
                        type="number"
                        min="0"
                        value={fila[campo]}
                        onChange={(e) =>
                          actualizar(mesActivo, fi, campo, e.target.value)
                        }
                        style={inpS}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "rgba(56,136,211,0.5)")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "var(--border-input)")
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-input)" }}>
                <td
                  colSpan={2}
                  style={{
                    ...tdS,
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  TOTALES
                </td>
                {[
                  "total",
                  "a_favor",
                  "en_contra",
                  "reposicion",
                  "apelacion",
                ].map((campo) => (
                  <td
                    key={campo}
                    style={{
                      ...tdS,
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {pqr[mesActivo].filas.reduce(
                      (acc, f) => acc + (parseInt(f[campo]) || 0),
                      0,
                    )}
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

// ── Paso 4: Revisión ──────────────────────────────────────────────
function PasoRevision({ periodo, planes, pqr }) {
  const empresa = JSON.parse(localStorage.getItem("empresa") ?? "{}");
  const totalAccesos = planes.reduce(
    (a, p) => a + (parseInt(p.accesos) || 0),
    0,
  );
  const totalPQR = pqr.reduce(
    (t, m) => t + m.filas.reduce((tt, f) => tt + (parseInt(f.total) || 0), 0),
    0,
  );

  const Item = ({ label, valor, ok }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "0.5px solid var(--border-card)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--text-primary)",
          }}
        >
          {valor}
        </span>
        {ok !== undefined && (
          <span style={{ fontSize: "10px", color: ok ? "#34d399" : "#f87171" }}>
            {ok ? "✓" : "⚠"}
          </span>
        )}
      </div>
    </div>
  );

  const validaciones = [
    { label: "Período definido", ok: !!periodo.anio && !!periodo.trimestre },
    { label: "Municipio ingresado", ok: !!periodo.municipio },
    {
      label: "Planes completos",
      ok: planes.every((p) => p.municipio && p.accesos && p.vel_bajada),
    },
    { label: "Accesos > 0", ok: totalAccesos > 0 },
    { label: "Formato T.1.2", ok: true },
    { label: "Listo para HECAA", ok: totalAccesos > 0 && !!periodo.municipio },
  ];

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
    >
      <div style={S.card}>
        <p style={S.sectionTitle}>Resumen del reporte</p>
        <Item label="Operador" valor={empresa.razon_social} ok={true} />
        <Item label="NIT" valor={empresa.nit} ok={true} />
        <Item
          label="Período"
          valor={`${periodo.trimestre} — ${periodo.anio}`}
          ok={true}
        />
        <Item
          label="Municipio"
          valor={periodo.municipio || "Sin definir"}
          ok={!!periodo.municipio}
        />
        <Item
          label="Planes registrados"
          valor={planes.length}
          ok={planes.length > 0}
        />
        <Item
          label="Total accesos"
          valor={totalAccesos.toLocaleString("es-CO")}
          ok={totalAccesos > 0}
        />
        <Item label="Total PQR" valor={totalPQR} ok={true} />
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Detalle de planes</p>
        {planes.map((p, i) => (
          <div
            key={p.id}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              background: "var(--bg-input)",
              marginBottom: "6px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              Plan #{i + 1} — {p.municipio || "Sin municipio"} · {p.tecnologia}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                `↓ ${p.vel_bajada || "—"} Mbps`,
                `↑ ${p.vel_subida || "—"} Mbps`,
                `$${parseInt(p.valor_plan || 0).toLocaleString("es-CO")}`,
                `${p.accesos || "—"} accesos`,
              ].map((d) => (
                <span
                  key={d}
                  style={{ fontSize: "10px", color: "var(--text-muted)" }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          ...S.card,
          gridColumn: "span 2",
          background: "rgba(24,95,165,0.08)",
          border: "1px solid rgba(56,136,211,0.2)",
        }}
      >
        <p style={{ ...S.sectionTitle, color: "#93c5fd" }}>
          Validación antes de generar
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "10px",
          }}
        >
          {validaciones.map((v) => (
            <div
              key={v.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "8px",
                background: v.ok
                  ? "rgba(52,211,153,0.08)"
                  : "rgba(248,113,113,0.08)",
                border: `0.5px solid ${v.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
              }}
            >
              <span style={{ fontSize: "14px" }}>{v.ok ? "✓" : "⚠"}</span>
              <span
                style={{
                  fontSize: "11px",
                  color: v.ok ? "#34d399" : "#f87171",
                }}
              >
                {v.label}
              </span>
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
  const [paso, setPaso] = useState(1);
  const [periodo, setPeriodo] = useState({
    anio: "2026",
    trimestre: "2T",
    municipio: empresa.municipio ?? "",
  });
  const [planes, setPlanes] = useState([planVacio()]);
  const [pqr, setPQR] = useState(
    MESES_POR_TRIMESTRE["2T"].map((mes) => pqrVacio(mes)),
  );

  const handlePeriodoChange = (campo, valor) => {
    setPeriodo((prev) => {
      const nuevo = { ...prev, [campo]: valor };
      if (campo === "trimestre")
        setPQR(MESES_POR_TRIMESTRE[valor].map((mes) => pqrVacio(mes)));
      return nuevo;
    });
  };

  const puedeAvanzar = () => {
    if (paso === 1) return !!periodo.anio && !!periodo.trimestre;
    if (paso === 2) return planes.length > 0;
    return true;
  };

  const generarReporte = () =>
    alert(
      `✅ Reporte T.1.2 — ${periodo.trimestre} ${periodo.anio}\n\nEn la siguiente fase se generará el Excel automáticamente.`,
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "1100px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "17px",
              fontWeight: "500",
              color: "var(--text-primary)",
            }}
          >
            Formato T.1.2 — Formato Unificado ISP
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "3px",
            }}
          >
            Resolución CRC 7811 · Reporte trimestral ante HECAA
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span
            style={{
              fontSize: "10px",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(56,136,211,0.15)",
              border: "0.5px solid rgba(56,136,211,0.3)",
              color: "#93c5fd",
            }}
          >
            CRC · HECAA
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(251,191,36,0.12)",
              border: "0.5px solid rgba(251,191,36,0.25)",
              color: "#fbbf24",
            }}
          >
            Vence 45 días post-trimestre
          </span>
        </div>
      </div>

      <IndicadorPasos actual={paso} />

      {paso === 1 && (
        <PasoPeriodo datos={periodo} onChange={handlePeriodoChange} />
      )}
      {paso === 2 && <PasoPlanes planes={planes} onChange={setPlanes} />}
      {paso === 3 && <PasoPQR pqr={pqr} onChange={setPQR} />}
      {paso === 4 && (
        <PasoRevision periodo={periodo} planes={planes} pqr={pqr} />
      )}

      {/* Navegación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "4px",
        }}
      >
        <button
          onClick={() => setPaso((p) => Math.max(1, p - 1))}
          disabled={paso === 1}
          style={{
            ...S.btnSecondary,
            opacity: paso === 1 ? 0.4 : 1,
            cursor: paso === 1 ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (paso > 1)
              e.currentTarget.style.background = "var(--bg-card-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-input)";
          }}
        >
          ← Anterior
        </button>

        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Paso {paso} de {PASOS.length}
        </span>

        {paso < 4 ? (
          <button
            onClick={() => {
              if (puedeAvanzar()) setPaso((p) => p + 1);
            }}
            disabled={!puedeAvanzar()}
            style={{
              ...S.btnPrimary,
              opacity: puedeAvanzar() ? 1 : 0.5,
              cursor: puedeAvanzar() ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (puedeAvanzar()) e.currentTarget.style.background = "#0C447C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#185FA5";
            }}
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
