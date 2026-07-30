// src/controllers/dashboardController.js
import { pool } from '../db/pool.js';

// ── Dashboard empresa ─────────────────────────────────────────────
export async function dashboardEmpresa(req, res) {
  const empresa_id = req.empresa.id;

  try {
    // Reportes T.1.2 de la empresa
    const [reportesT12] = await pool.query(
      `SELECT id, anio, trimestre, estado, created_at, updated_at
       FROM reportes_t12
       WHERE empresa_id = ?
       ORDER BY anio DESC, trimestre DESC
       LIMIT 10`,
      [empresa_id]
    );

    // Reportes F.7 de la empresa
    const [reportesF7] = await pool.query(
      `SELECT id, anio, trimestre, estado, created_at, updated_at
       FROM reportes_f7
       WHERE empresa_id = ?
       ORDER BY anio DESC, trimestre DESC
       LIMIT 10`,
      [empresa_id]
    );

    // Totales
    const totalReportes     = reportesT12.length + reportesF7.length;
    const reportesAprobados = [...reportesT12, ...reportesF7]
      .filter(r => r.estado === 'aprobado').length;

    // Obligaciones del trimestre actual
    const ahora      = new Date();
    const mes        = ahora.getMonth() + 1;
    const trimestre  = mes <= 3 ? '1T' : mes <= 6 ? '2T' : mes <= 9 ? '3T' : '4T';
    const anio       = ahora.getFullYear();

    // Calcular días restantes al próximo vencimiento
    // Vencimiento: 45 días después del fin del trimestre
    const finTrimestre = {
      '1T': new Date(anio, 2,  31),
      '2T': new Date(anio, 5,  30),
      '3T': new Date(anio, 8,  30),
      '4T': new Date(anio, 11, 31),
    };

    const fechaVence    = new Date(finTrimestre[trimestre]);
    fechaVence.setDate(fechaVence.getDate() + 45);
    const diasRestantes = Math.ceil((fechaVence - ahora) / (1000 * 60 * 60 * 24));

    // Reporte del trimestre actual
    const [reporteActual] = await pool.query(
      `SELECT id, estado FROM reportes_t12
       WHERE empresa_id = ? AND anio = ? AND trimestre = ?`,
      [empresa_id, anio, trimestre]
    );

    return res.json({
      resumen: {
        total_reportes:      totalReportes,
        reportes_aprobados:  reportesAprobados,
        trimestre_actual:    trimestre,
        anio_actual:         anio,
        dias_al_vencimiento: diasRestantes,
        reporte_actual:      reporteActual[0] ?? null,
      },
      reportes_t12: reportesT12,
      reportes_f7:  reportesF7,
    });

  } catch (err) {
    console.error('[dashboardEmpresa]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Dashboard admin ───────────────────────────────────────────────
export async function dashboardAdmin(req, res) {
  try {
    // Total empresas activas
    const [totalEmpresas] = await pool.query(
      `SELECT COUNT(*) as total FROM empresas WHERE rol = 'empresa' AND estado = 'activo'`
    );

    // Reportes por estado
    const [reportesPorEstado] = await pool.query(
      `SELECT estado, COUNT(*) as total
       FROM reportes_t12
       GROUP BY estado`
    );

    // Empresas sin reporte en el trimestre actual
    const ahora     = new Date();
    const mes       = ahora.getMonth() + 1;
    const trimestre = mes <= 3 ? '1T' : mes <= 6 ? '2T' : mes <= 9 ? '3T' : '4T';
    const anio      = ahora.getFullYear();

    const [sinReporte] = await pool.query(
      `SELECT COUNT(*) as total
       FROM empresas e
       WHERE e.rol = 'empresa'
       AND e.estado = 'activo'
       AND NOT EXISTS (
         SELECT 1 FROM reportes_t12 r
         WHERE r.empresa_id = e.id
         AND r.anio = ? AND r.trimestre = ?
       )`,
      [anio, trimestre]
    );

    // Últimos reportes enviados
    const [ultimosReportes] = await pool.query(
      `SELECT r.id, r.anio, r.trimestre, r.estado, r.created_at,
              e.razon_social, e.nit
       FROM reportes_t12 r
       JOIN empresas e ON e.id = r.empresa_id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    // Reportes pendientes de revisión
    const [pendientes] = await pool.query(
      `SELECT COUNT(*) as total FROM reportes_t12
       WHERE estado = 'pendiente_revision'`
    );

    return res.json({
      resumen: {
        total_empresas:       totalEmpresas[0].total,
        empresas_sin_reporte: sinReporte[0].total,
        pendientes_revision:  pendientes[0].total,
        trimestre_actual:     trimestre,
        anio_actual:          anio,
      },
      reportes_por_estado: reportesPorEstado,
      ultimos_reportes:    ultimosReportes,
    });

  } catch (err) {
    console.error('[dashboardAdmin]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}