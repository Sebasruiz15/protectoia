// archivo: src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Login        } from "@/pages/Login";
import { Registro     } from "@/pages/Registro";
import { PortalEmpresa } from "@/pages/PortalEmpresa";
import { Dashboard    } from "@/pages/Dashboard";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Portal — rutas protegidas */}
        <Route path="/portal" element={<PortalEmpresa />}>
          <Route index element={<Dashboard />} />

          {/* Reportes — placeholders por ahora */}
          <Route path="reportes/t12" element={<Placeholder titulo="Formato T.1.2 — ISP" />} />
          <Route path="reportes/t11" element={<Placeholder titulo="Formato T.1.1 — ISP Empresarial" />} />
          <Route path="reportes/f7"  element={<Placeholder titulo="Formato 7 — Televisión" />} />

          {/* Otras secciones */}
          <Route path="calendario" element={<Placeholder titulo="Calendario regulatorio" />} />
          <Route path="empresa"    element={<Placeholder titulo="Mi empresa" />} />
        </Route>

        {/* Raíz → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

// ── Placeholder temporal para secciones en construcción ───────────
function Placeholder({ titulo }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-white">{titulo}</h1>
      <div
        className="rounded-2xl p-10 flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          border:     "1px solid rgba(255,255,255,0.06)",
          minHeight:  "300px",
        }}
      >
        <p className="text-sm" style={{ color: "rgba(147,197,253,0.4)" }}>
          Módulo en construcción — próximamente
        </p>
      </div>
    </div>
  );
}