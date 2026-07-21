// archivo: src/pages/PortalEmpresa.jsx
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar  } from "@/components/layout/Topbar";

export function PortalEmpresa() {
  const raw     = localStorage.getItem("empresa");
  const empresa = raw ? JSON.parse(raw) : null;

  if (!empresa) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      <Sidebar empresa={empresa} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar empresa={empresa} />
        <main style={{ flex: 1, overflowY: "auto", padding: "16px 20px", background: "var(--bg-base)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}