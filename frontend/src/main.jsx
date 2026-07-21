// archivo: src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/context/ThemeContext";
import { Login          } from "@/pages/Login";
import { Registro       } from "@/pages/Registro";
import { PortalEmpresa  } from "@/pages/PortalEmpresa";
import { Dashboard      } from "@/pages/Dashboard";
import { FormularioT12  } from "@/pages/FormularioT12";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/portal" element={<PortalEmpresa />}>
            <Route index                element={<Dashboard />} />
            <Route path="reportes/t12"  element={<FormularioT12 />} />
            <Route path="reportes/t11"  element={<Placeholder titulo="Formato T.1.1 — ISP Empresarial" />} />
            <Route path="reportes/f7"   element={<Placeholder titulo="Formato 7 — Televisión" />} />
            <Route path="calendario"    element={<Placeholder titulo="Calendario regulatorio" />} />
            <Route path="empresa"       element={<Placeholder titulo="Mi empresa" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

function Placeholder({ titulo }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 style={{ fontSize: "17px", fontWeight: "500", color: "var(--text-primary)" }}>
        {titulo}
      </h1>
      <div style={{
        background:  "var(--bg-card)",
        border:      "1px solid var(--border-card)",
        borderRadius: "12px",
        minHeight:   "300px",
        display:     "flex",
        alignItems:  "center",
        justifyContent: "center",
      }}>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Módulo en construcción
        </p>
      </div>
    </div>
  );
}