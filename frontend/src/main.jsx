// archivo: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Estilos globales — siempre primero
import './index.css';

// Páginas públicas (auth)
import { Login }    from '@/pages/Login';
import { Registro } from '@/pages/Registro';

// Páginas privadas — las construimos en los siguientes archivos
// import { PortalEmpresa } from '@/pages/PortalEmpresa';
// import { PanelAdmin }   from '@/pages/PanelAdmin';

/*
  Guardia de ruta simple — en el siguiente paso la mejoramos con contexto de auth.
  Por ahora redirige al login si no hay token en localStorage.
*/
function RutaPrivada({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas */}
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas privadas — se descomentan al ir construyendo */}
        {/*
        <Route path="/portal" element={
          <RutaPrivada><PortalEmpresa /></RutaPrivada>
        } />
        <Route path="/admin" element={
          <RutaPrivada><PanelAdmin /></RutaPrivada>
        } />
        */}

        {/* Catch-all: cualquier ruta no encontrada va al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
