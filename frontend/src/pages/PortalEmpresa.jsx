// archivo: src/pages/PortalEmpresa.jsx
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar  } from "@/components/layout/Topbar";

export function PortalEmpresa() {
  const raw     = localStorage.getItem("empresa");
  const empresa = raw ? JSON.parse(raw) : null;

  // Si no hay sesión, redirige al login
  if (!empresa) return <Navigate to="/login" replace />;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#021018" }}
    >
      <Sidebar empresa={empresa} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar empresa={empresa} />

        {/* Área de contenido */}
       <main
  className="flex-1 overflow-y-auto"
  style={{ background: "#021018", padding: "16px 20px" }}
>
  <Outlet />
</main>
      </div>
    </div>
  );
}