// archivo: src/pages/PanelAdmin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "@/context/ThemeContext";
import { api } from "@/services/api";
import * as XLSX from "xlsx-js-style";

// ── Constantes ────────────────────────────────────────────────────
const TIPO_LABEL = {
  ISP_RESIDENCIAL: "Residencial",
  ISP_EMPRESARIAL: "Empresarial",
  ISP_MIXTO:       "Mixto",
  ISP_TV:          "Internet + TV",
  ISP_TV_MIXTO:    "Mixto + TV",
};

const NIVEL = {
  al_dia:  { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", label: "Al día"  },
  proximo: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", label: "Próximo" },
  critico: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  label: "Crítico" },
};

// ── Hook datos admin ──────────────────────────────────────────────
function useDatosAdmin() {
  const [empresas,  setEmpresas]  = useState([]);
  const [reportes,  setReportes]  = useState([]);
  const [resumen,   setResumen]   = useState(null);
  const [cargando,  setCargando]  = useState(true);

  const cargar = async () => {
    try {
      const [resEmpresas, resReportes, resDash] = await Promise.all([
        api.get("/reportes/admin/empresas"),
        api.get("/reportes/admin/t12"),
        api.get("/dashboard/admin"),
      ]);
      setEmpresas(resEmpresas.data.empresas);
      setReportes(resReportes.data.reportes);
      setResumen(resDash.data.resumen);
    } catch (err) {
      console.error("Error cargando datos admin:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  return { empresas, reportes, resumen, cargando, recargar: cargar };
}

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

// ── Tarjeta métrica ───────────────────────────────────────────────
function MetricaCard({ label, valor, color, sub }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "14px" }}>
      <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "24px", fontWeight: "600", color: color ?? "var(--text-primary)" }}>{valor}</p>
      {sub && <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

// ── Generador Excel ───────────────────────────────────────────────
function generarExcel(reporte) {
  const AZUL_OSCURO = "0C2340";
  const AZUL_MEDIO  = "185FA5";
  const AZUL_CLARO  = "E6F1FB";
  const BLANCO      = "FFFFFF";
  const GRIS_CLARO  = "F4F8FC";

  const sEnc = { font: { bold: true, sz: 10, color: { rgb: BLANCO } }, fill: { fgColor: { rgb: AZUL_MEDIO } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: { style: "thin", color: { rgb: BLANCO } }, bottom: { style: "thin", color: { rgb: BLANCO } }, left: { style: "thin", color: { rgb: BLANCO } }, right: { style: "thin", color: { rgb: BLANCO } } } };
  const sTit = { font: { bold: true, sz: 14, color: { rgb: BLANCO } }, fill: { fgColor: { rgb: AZUL_OSCURO } }, alignment: { horizontal: "left", vertical: "center" } };
  const sSub = { font: { sz: 10, color: { rgb: BLANCO } }, fill: { fgColor: { rgb: AZUL_MEDIO } }, alignment: { horizontal: "left", vertical: "center" } };
  const sLbl = { font: { bold: true, sz: 10, color: { rgb: AZUL_OSCURO } }, fill: { fgColor: { rgb: AZUL_CLARO } }, alignment: { horizontal: "left", vertical: "center" }, border: { bottom: { style: "thin", color: { rgb: "DDDDDD" } } } };
  const sVal = { font: { sz: 10 }, alignment: { horizontal: "left", vertical: "center" }, border: { bottom: { style: "thin", color: { rgb: "DDDDDD" } } } };
  const sDat = { font: { sz: 10 }, fill: { fgColor: { rgb: BLANCO } }, alignment: { horizontal: "left", vertical: "center" }, border: { bottom: { style: "thin", color: { rgb: "EEEEEE" } }, right: { style: "thin", color: { rgb: "EEEEEE" } } } };
  const sAlt = { ...sDat, fill: { fgColor: { rgb: GRIS_CLARO } } };
  const sNum = (alt) => ({ font: { sz: 10 }, fill: { fgColor: { rgb: alt ? GRIS_CLARO : BLANCO } }, alignment: { horizontal: "right", vertical: "center" }, numFmt: "#,##0", border: { bottom: { style: "thin", color: { rgb: "EEEEEE" } }, right: { style: "thin", color: { rgb: "EEEEEE" } } } });
  const sTot = { font: { bold: true, sz: 10, color: { rgb: BLANCO } }, fill: { fgColor: { rgb: AZUL_OSCURO } }, alignment: { horizontal: "center", vertical: "center" } };
  const sStot = { font: { bold: true, sz: 10, color: { rgb: AZUL_OSCURO } }, fill: { fgColor: { rgb: AZUL_CLARO } }, alignment: { horizontal: "center", vertical: "center" }, border: { bottom: { style: "medium", color: { rgb: AZUL_MEDIO } } } };
  const sSec = { font: { bold: true, sz: 11, color: { rgb: AZUL_OSCURO } }, fill: { fgColor: { rgb: AZUL_CLARO } }, alignment: { horizontal: "left", vertical: "center" }, border: { left: { style: "medium", color: { rgb: AZUL_MEDIO } } } };

  const wb    = XLSX.utils.book_new();
  const planes = reporte.datos_planes ?? [];
  const pqr    = reporte.datos_pqr    ?? [];

  // Hoja 1: Identificación
  const wsInfo = XLSX.utils.aoa_to_sheet([
    ["FORMATO T.1.2 — FORMATO UNIFICADO ISP", ""],
    ["Resolución CRC 7811 · Reporte de información sectorial", ""],
    ["", ""],
    ["DATOS DEL OPERADOR", ""],
    ["Operador",         reporte.razon_social ?? ""],
    ["NIT",              reporte.nit          ?? ""],
    ["Tipo de ISP",      reporte.tipo_isp     ?? ""],
    ["", ""],
    ["PERÍODO DE REPORTE", ""],
    ["Año",              reporte.anio],
    ["Trimestre",        reporte.trimestre],
    ["Municipio",        reporte.municipio],
    ["", ""],
    ["GENERACIÓN", ""],
    ["Fecha generación", new Date().toLocaleDateString("es-CO")],
    ["Estado",           reporte.estado],
  ]);
  wsInfo["!cols"]   = [{ wch: 22 }, { wch: 45 }];
  wsInfo["!rows"]   = [{ hpt: 28 }, { hpt: 18 }];
  wsInfo["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } },
    { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } },
  ];
  wsInfo["A1"].s = sTit; wsInfo["B1"].s = sTit;
  wsInfo["A2"].s = sSub; wsInfo["B2"].s = sSub;
  ["A4","A9","A14"].forEach(c => { if (wsInfo[c]) wsInfo[c].s = sSec; });
  ["A5","A6","A7","A10","A11","A12","A15","A16"].forEach(c => { if (wsInfo[c]) wsInfo[c].s = sLbl; });
  ["B5","B6","B7","B10","B11","B12","B15","B16"].forEach(c => { if (wsInfo[c]) wsInfo[c].s = sVal; });
  XLSX.utils.book_append_sheet(wb, wsInfo, "Identificación");

  // Hoja 2: Planes ISP
  const cabP = ["Municipio","Departamento","Clase","Segmento","Tecnología","Vel. Bajada (Mbps)","Vel. Subida (Mbps)","Valor Plan sin IVA ($)","Accesos Activos"];
  const filP  = planes.map(p => [p.municipio, p.departamento, p.clase, p.segmento, p.tecnologia, parseFloat(p.vel_bajada)||0, parseFloat(p.vel_subida)||0, parseFloat(p.valor_plan)||0, parseInt(p.accesos)||0]);
  const totA  = planes.reduce((a,p)=>a+(parseInt(p.accesos)||0),0);
  const totV  = planes.reduce((a,p)=>a+(parseFloat(p.valor_plan)||0),0);
  const wsP   = XLSX.utils.aoa_to_sheet([cabP,...filP,["TOTALES","","","","","","",totV,totA]]);
  wsP["!cols"] = [{wch:18},{wch:16},{wch:14},{wch:14},{wch:14},{wch:18},{wch:18},{wch:22},{wch:16}];
  wsP["!rows"] = [{ hpt: 36 }];
  "ABCDEFGHI".split("").forEach(col => { const c=`${col}1`; if(wsP[c]) wsP[c].s=sEnc; });
  filP.forEach((_,i)=>{
    const f=i+2, alt=i%2!==0;
    ["A","B","C","D","E"].forEach(col=>{const c=`${col}${f}`;if(wsP[c])wsP[c].s=alt?sAlt:sDat;});
    ["F","G","H","I"].forEach(col=>{const c=`${col}${f}`;if(wsP[c])wsP[c].s=sNum(alt);});
  });
  const fTot=filP.length+2;
  "ABCDEFGHI".split("").forEach(col=>{const c=`${col}${fTot}`;if(wsP[c])wsP[c].s=sTot;});
  XLSX.utils.book_append_sheet(wb, wsP, "Planes ISP");

  // Hoja 3: PQR
  const cabQ   = ["Mes","Código","Tipología","Total PQR","A favor usuario","A favor operador","Reposición","Apelación"];
  const cols   = ["FFFFFF","F4F8FC","EDF4FF"];
  const filQ   = [];
  pqr.forEach((mes,mi)=>{
    mes.filas.forEach(f=>{filQ.push([mes.mes,f.codigo,f.desc,parseInt(f.total)||0,parseInt(f.a_favor)||0,parseInt(f.en_contra)||0,parseInt(f.reposicion)||0,parseInt(f.apelacion)||0,mi]);});
    filQ.push([`TOTAL ${mes.mes.toUpperCase()}`,"","",mes.filas.reduce((a,f)=>a+(parseInt(f.total)||0),0),mes.filas.reduce((a,f)=>a+(parseInt(f.a_favor)||0),0),mes.filas.reduce((a,f)=>a+(parseInt(f.en_contra)||0),0),mes.filas.reduce((a,f)=>a+(parseInt(f.reposicion)||0),0),mes.filas.reduce((a,f)=>a+(parseInt(f.apelacion)||0),0),-1]);
  });
  const wsQ = XLSX.utils.aoa_to_sheet([cabQ,...filQ.map(f=>f.slice(0,8))]);
  wsQ["!cols"]=[{wch:14},{wch:8},{wch:32},{wch:12},{wch:16},{wch:16},{wch:12},{wch:12}];
  wsQ["!rows"]=[{hpt:36}];
  "ABCDEFGH".split("").forEach(col=>{const c=`${col}1`;if(wsQ[c])wsQ[c].s=sEnc;});
  filQ.forEach((fila,i)=>{
    const row=i+2, ci=fila[8], esT=ci===-1, cb=cols[ci%cols.length]??BLANCO;
    "ABCDEFGH".split("").forEach((col,j)=>{
      const c=`${col}${row}`;if(!wsQ[c])return;
      if(esT){wsQ[c].s=sStot;}
      else if(j<3){wsQ[c].s={...sDat,fill:{fgColor:{rgb:cb}}};}
      else{wsQ[c].s={...sNum(false),fill:{fgColor:{rgb:cb}}};}
    });
  });
  XLSX.utils.book_append_sheet(wb, wsQ, "PQR");

  const nit    = (reporte.nit??"SIN_NIT").replace(/[^0-9]/g,"");
  const nombre = `T1_2_${nit}_${reporte.trimestre}_${reporte.anio}_${reporte.estado}.xlsx`;
  XLSX.writeFile(wb, nombre);
}

// ── Vista detalle empresa ─────────────────────────────────────────
function DetalleEmpresa({ empresa, reportes, onVolver }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onVolver} style={{ background: "var(--bg-input)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}>
          ← Volver
        </button>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)" }}>{empresa.razon_social}</h2>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>NIT {empresa.nit} · {TIPO_LABEL[empresa.tipo_isp]} · {empresa.municipio}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        <MetricaCard label="Total reportes"  valor={empresa.total_reportes ?? 0} color="#185FA5" />
        <MetricaCard label="Estado"          valor={empresa.estado}              color="#10b981" />
        <MetricaCard label="Último reporte"  valor={empresa.ultimo_reporte ? new Date(empresa.ultimo_reporte).toLocaleDateString("es-CO") : "—"} color="#f59e0b" />
        <MetricaCard label="Tipo ISP"        valor={TIPO_LABEL[empresa.tipo_isp] ?? "—"} color="#185FA5" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Datos del operador</p>
          {[
            { label: "Representante legal", valor: empresa.rep_legal },
            { label: "Correo",              valor: empresa.email },
            { label: "Municipio",           valor: empresa.municipio },
            { label: "Tipo de ISP",         valor: TIPO_LABEL[empresa.tipo_isp] },
            { label: "Total reportes",      valor: empresa.total_reportes ?? 0 },
            { label: "Último reporte",      valor: empresa.ultimo_reporte ? new Date(empresa.ultimo_reporte).toLocaleDateString("es-CO") : "—" },
          ].map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid var(--border-card)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.label}</span>
              <span style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-primary)" }}>{r.valor}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Estado regulatorio</p>
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "var(--bg-input)" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Esta empresa tiene <strong style={{ color: "var(--text-primary)" }}>{empresa.total_reportes ?? 0}</strong> reportes enviados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel Admin ───────────────────────────────────────────────────
export function PanelAdmin() {
  const navigate             = useNavigate();
  const { tema, toggleTema } = useTema();
  const isDark               = tema === "dark";
  const admin                = JSON.parse(localStorage.getItem("empresa") ?? "{}");

  const { empresas, reportes, resumen, cargando, recargar } = useDatosAdmin();

  const [busqueda,       setBusqueda]       = useState("");
  const [empresaDetalle, setEmpresaDetalle] = useState(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresa");
    navigate("/login", { replace: true });
  };

  const empresasFiltradas = empresas.filter((e) =>
    e.razon_social.toLowerCase().includes(busqueda.toLowerCase()) || e.nit.includes(busqueda)
  );

  const cambiarEstado = async (id, estado, observaciones = null) => {
    try {
      await api.patch(`/reportes/admin/t12/${id}`, { estado, ...(observaciones && { observaciones }) });
      recargar();
    } catch (err) {
      console.error(err);
    }
  };

  const btnStyle = {
    width: "34px", height: "34px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* Topbar */}
      <header style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "var(--bg-topbar)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "#185FA5", color: "white" }}>
            <IconBolt />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", lineHeight: 1.2 }}>Gesco IA</p>
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Panel de administración</p>
          </div>
          <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "rgba(24,95,165,0.15)", border: "0.5px solid rgba(24,95,165,0.3)", color: "#185FA5", marginLeft: "8px" }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={toggleTema} style={btnStyle} title="Cambiar tema">
            {isDark ? <IconSol /> : <IconLuna />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white" }}>IA</div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>{admin.email ?? "admin@gesco.co"}</p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Administrador</p>
            </div>
          </div>
          <button onClick={cerrarSesion} style={{ ...btnStyle, color: "rgba(239,68,68,0.7)" }} title="Cerrar sesión">
            <IconLogout />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px" }}>

        {empresaDetalle ? (
          <DetalleEmpresa
            empresa={empresaDetalle}
            reportes={reportes.filter(r => r.razon_social === empresaDetalle.razon_social)}
            onVolver={() => setEmpresaDetalle(null)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Header */}
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: "500", color: "var(--text-primary)" }}>Panel de seguimiento regulatorio</h1>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Vista global de todas las empresas · {new Date().toLocaleDateString("es-CO", { dateStyle: "long" })}
              </p>
            </div>

            {/* Métricas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px" }}>
              <MetricaCard label="Total empresas"        valor={resumen?.total_empresas       ?? "—"} color="var(--text-primary)" />
              <MetricaCard label="Sin reporte trimestre" valor={resumen?.empresas_sin_reporte ?? "—"} color="#f59e0b" />
              <MetricaCard label="Pendientes revisión"   valor={resumen?.pendientes_revision  ?? "—"} color="#ef4444" />
              <MetricaCard label="Trimestre actual"      valor={resumen ? `${resumen.trimestre_actual} ${resumen.anio_actual}` : "—"} color="#185FA5" />
              <MetricaCard label="Reportes recibidos"    valor={reportes.length}                      color="#10b981" />
            </div>

            {/* Búsqueda */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "12px 16px" }}>
              <input
                type="text"
                placeholder="Buscar por nombre o NIT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, border: "1px solid var(--border-input)", borderRadius: "8px", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: "13px", padding: "7px 12px", outline: "none" }}
              />
              <p style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {empresasFiltradas.length} empresa{empresasFiltradas.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Tabla empresas */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-input)" }}>
                    {["Empresa","NIT","Tipo ISP","Municipio","Reportes","Último reporte","Estado",""].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: "9px", fontWeight: "600", letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid var(--border-card)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map((e, i) => (
                    <tr key={e.id}
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
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", background: "rgba(24,95,165,0.1)", color: "#185FA5", border: "0.5px solid rgba(24,95,165,0.2)" }}>
                          {TIPO_LABEL[e.tipo_isp] ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{e.municipio}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "500", color: "#185FA5" }}>{e.total_reportes ?? 0} reportes</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>
                        {e.ultimo_reporte ? new Date(e.ultimo_reporte).toLocaleDateString("es-CO") : "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{e.estado}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => setEmpresaDetalle(e)}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", background: "rgba(24,95,165,0.1)", border: "0.5px solid rgba(24,95,165,0.25)", color: "#185FA5", fontSize: "11px", fontWeight: "500", cursor: "pointer" }}>
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla reportes recibidos */}
            {reportes.length > 0 && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-card)" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                    Reportes T.1.2 recibidos ({reportes.length})
                  </p>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-input)" }}>
                      {["Empresa","NIT","Período","Estado","Fecha envío","Acciones"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: "9px", fontWeight: "600", letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid var(--border-card)", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.map((r, i) => (
                      <tr key={r.id}
                        style={{ borderBottom: i < reportes.length - 1 ? "0.5px solid var(--border-card)" : "none" }}
                        onMouseEnter={(el) => (el.currentTarget.style.background = "var(--bg-card-hover)")}
                        onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>{r.razon_social}</p>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>{r.nit}</td>
                        <td style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "500", color: "var(--text-primary)" }}>{r.trimestre} {r.anio}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
                            background: r.estado === "aprobado" ? "rgba(16,185,129,0.1)" : r.estado === "rechazado" ? "rgba(239,68,68,0.1)" : r.estado === "con_observaciones" ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.1)",
                            color:      r.estado === "aprobado" ? "#10b981"              : r.estado === "rechazado" ? "#ef4444"              : "#f59e0b",
                            border:     `0.5px solid ${r.estado === "aprobado" ? "rgba(16,185,129,0.3)" : r.estado === "rechazado" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                          }}>
                            {r.estado === "pendiente_revision" ? "Pendiente" : r.estado === "aprobado" ? "Aprobado" : r.estado === "con_observaciones" ? "Con obs." : r.estado === "rechazado" ? "Rechazado" : r.estado}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(r.created_at).toLocaleDateString("es-CO")}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>

                            {/* Descargar Excel */}
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await api.get(`/reportes/t12/${r.id}`);
                                  generarExcel({ ...data.reporte, razon_social: r.razon_social, nit: r.nit, tipo_isp: r.tipo_isp });
                                } catch (err) { console.error(err); }
                              }}
                              style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", cursor: "pointer", background: "rgba(24,95,165,0.1)", color: "#185FA5", border: "0.5px solid rgba(24,95,165,0.3)" }}
                            >
                              📥 Excel
                            </button>

                            {/* Aprobar */}
                            {r.estado !== "aprobado" && (
                              <button onClick={() => cambiarEstado(r.id, "aprobado")}
                                style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", cursor: "pointer", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "0.5px solid rgba(16,185,129,0.3)" }}>
                                ✓ Aprobar
                              </button>
                            )}

                            {/* Observaciones */}
                            {r.estado !== "aprobado" && (
                              <button onClick={async () => {
                                const obs = prompt("Escribe las observaciones para la empresa:");
                                if (!obs) return;
                                cambiarEstado(r.id, "con_observaciones", obs);
                              }}
                                style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", cursor: "pointer", background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "0.5px solid rgba(245,158,11,0.3)" }}>
                                ⚠ Obs.
                              </button>
                            )}

                            {/* Rechazar */}
                            {r.estado !== "aprobado" && r.estado !== "rechazado" && (
                              <button onClick={() => cambiarEstado(r.id, "rechazado")}
                                style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "0.5px solid rgba(239,68,68,0.3)" }}>
                                ✗ Rechazar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}