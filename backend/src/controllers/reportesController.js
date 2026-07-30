// src/controllers/reportesController.js
import { pool } from '../db/pool.js';

// ── Guardar reporte T.1.2 ─────────────────────────────────────────
export async function guardarT12(req, res) {
  const { anio, trimestre, municipio, datos_planes, datos_pqr } = req.body;
  const empresa_id = req.empresa.id;

  if (!anio || !trimestre || !municipio || !datos_planes || !datos_pqr)
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos.' });

  try {
    const [existe] = await pool.query(
      'SELECT id FROM reportes_t12 WHERE empresa_id = ? AND anio = ? AND trimestre = ?',
      [empresa_id, anio, trimestre]
    );

    if (existe.length > 0) {
      // Actualizar reporte existente
      await pool.query(
        `UPDATE reportes_t12
         SET municipio = ?, datos_planes = ?, datos_pqr = ?,
             estado = 'pendiente_revision', updated_at = NOW()
         WHERE empresa_id = ? AND anio = ? AND trimestre = ?`,
        [municipio, JSON.stringify(datos_planes), JSON.stringify(datos_pqr),
         empresa_id, anio, trimestre]
      );

      const [rows] = await pool.query(
        'SELECT * FROM reportes_t12 WHERE empresa_id = ? AND anio = ? AND trimestre = ?',
        [empresa_id, anio, trimestre]
      );

      return res.json({ mensaje: 'Reporte actualizado.', reporte: rows[0] });
    }

    // Crear nuevo reporte
    const [result] = await pool.query(
      `INSERT INTO reportes_t12
        (empresa_id, anio, trimestre, municipio, datos_planes, datos_pqr, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente_revision')`,
      [empresa_id, anio, trimestre, municipio,
       JSON.stringify(datos_planes), JSON.stringify(datos_pqr)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM reportes_t12 WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ mensaje: 'Reporte guardado.', reporte: rows[0] });

  } catch (err) {
    console.error('[guardarT12]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Mis reportes T.1.2 (empresa) ─────────────────────────────────
export async function misReportesT12(req, res) {
  const empresa_id = req.empresa.id;
  try {
    const [rows] = await pool.query(
      `SELECT id, anio, trimestre, municipio, estado, observaciones,
              created_at, updated_at
       FROM reportes_t12
       WHERE empresa_id = ?
       ORDER BY anio DESC, trimestre DESC`,
      [empresa_id]
    );
    return res.json({ reportes: rows });
  } catch (err) {
    console.error('[misReportesT12]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Ver reporte T.1.2 por id ──────────────────────────────────────
export async function verReporteT12(req, res) {
  const { id } = req.params;
  const empresa_id = req.empresa.id;
  const esAdmin    = req.empresa.rol === 'admin';

  try {
    const [rows] = await pool.query(
      `SELECT r.*, e.razon_social, e.nit, e.tipo_isp, e.municipio as municipio_empresa
       FROM reportes_t12 r
       JOIN empresas e ON e.id = r.empresa_id
       WHERE r.id = ? ${esAdmin ? '' : 'AND r.empresa_id = ?'}`,
      esAdmin ? [id] : [id, empresa_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ mensaje: 'Reporte no encontrado.' });

    const reporte = rows[0];
    reporte.datos_planes = JSON.parse(reporte.datos_planes);
    reporte.datos_pqr    = JSON.parse(reporte.datos_pqr);

    return res.json({ reporte });
  } catch (err) {
    console.error('[verReporteT12]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Admin: todos los reportes T.1.2 ──────────────────────────────
export async function todosReportesT12(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.anio, r.trimestre, r.municipio, r.estado,
              r.observaciones, r.created_at, r.updated_at,
              e.razon_social, e.nit, e.tipo_isp
       FROM reportes_t12 r
       JOIN empresas e ON e.id = r.empresa_id
       ORDER BY r.created_at DESC`
    );
    return res.json({ reportes: rows });
  } catch (err) {
    console.error('[todosReportesT12]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Admin: actualizar estado de reporte T.1.2 ─────────────────────
export async function actualizarEstadoT12(req, res) {
  const { id }                    = req.params;
  const { estado, observaciones } = req.body;
  const revisado_por              = req.empresa.id;

  const estadosValidos = [
    'pendiente_revision', 'aprobado', 'con_observaciones', 'rechazado'
  ];

  if (!estadosValidos.includes(estado))
    return res.status(400).json({ mensaje: 'Estado inválido.' });

  try {
    await pool.query(
      `UPDATE reportes_t12
       SET estado = ?, observaciones = ?, revisado_por = ?, revisado_at = NOW()
       WHERE id = ?`,
      [estado, observaciones ?? null, revisado_por, id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM reportes_t12 WHERE id = ?', [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ mensaje: 'Reporte no encontrado.' });

    return res.json({ mensaje: 'Estado actualizado.', reporte: rows[0] });
  } catch (err) {
    console.error('[actualizarEstadoT12]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Admin: todas las empresas ─────────────────────────────────────
export async function todasEmpresas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.razon_social, e.nit, e.tipo_isp, e.email,
              e.rep_legal, e.municipio, e.estado, e.created_at,
              COUNT(DISTINCT r.id) as total_reportes,
              MAX(r.created_at)    as ultimo_reporte
       FROM empresas e
       LEFT JOIN reportes_t12 r ON r.empresa_id = e.id
       WHERE e.rol = 'empresa'
       GROUP BY e.id
       ORDER BY e.razon_social`
    );
    return res.json({ empresas: rows });
  } catch (err) {
    console.error('[todasEmpresas]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Admin: detalle de empresa ─────────────────────────────────────
export async function detalleEmpresa(req, res) {
  const { id } = req.params;
  try {
    const [empresa] = await pool.query(
      `SELECT id, razon_social, nit, tipo_isp, email, telefono,
              rep_legal, cargo_rep, municipio, estado, created_at
       FROM empresas WHERE id = ? AND rol = 'empresa'`,
      [id]
    );

    if (empresa.length === 0)
      return res.status(404).json({ mensaje: 'Empresa no encontrada.' });

    const [reportes] = await pool.query(
      `SELECT id, anio, trimestre, estado, created_at
       FROM reportes_t12 WHERE empresa_id = ?
       ORDER BY anio DESC, trimestre DESC`,
      [id]
    );

    return res.json({ empresa: empresa[0], reportes });
  } catch (err) {
    console.error('[detalleEmpresa]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}