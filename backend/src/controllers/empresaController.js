// src/controllers/empresaController.js
import bcrypt   from 'bcryptjs';
import { pool } from '../db/pool.js';

// ── Ver mi perfil ─────────────────────────────────────────────────
export async function miPerfil(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, razon_social, nit, tipo_isp, email, telefono,
              rep_legal, cargo_rep, municipio, estado, created_at
       FROM empresas WHERE id = ?`,
      [req.empresa.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ mensaje: 'Empresa no encontrada.' });

    return res.json({ empresa: rows[0] });
  } catch (err) {
    console.error('[miPerfil]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Actualizar perfil ─────────────────────────────────────────────
export async function actualizarPerfil(req, res) {
  const { razon_social, telefono, rep_legal, cargo_rep, municipio } = req.body;

  try {
    await pool.query(
      `UPDATE empresas
       SET razon_social = ?, telefono = ?, rep_legal = ?,
           cargo_rep = ?, municipio = ?
       WHERE id = ?`,
      [razon_social, telefono ?? null, rep_legal,
       cargo_rep ?? null, municipio ?? null, req.empresa.id]
    );

    const [rows] = await pool.query(
      `SELECT id, razon_social, nit, tipo_isp, email, telefono,
              rep_legal, cargo_rep, municipio, estado
       FROM empresas WHERE id = ?`,
      [req.empresa.id]
    );

    return res.json({ mensaje: 'Perfil actualizado.', empresa: rows[0] });
  } catch (err) {
    console.error('[actualizarPerfil]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Cambiar contraseña ────────────────────────────────────────────
export async function cambiarPassword(req, res) {
  const { password_actual, password_nuevo } = req.body;

  if (!password_actual || !password_nuevo)
    return res.status(400).json({ mensaje: 'Ambas contraseñas son requeridas.' });

  if (password_nuevo.length < 8)
    return res.status(400).json({ mensaje: 'La contraseña nueva debe tener mínimo 8 caracteres.' });

  try {
    const [rows] = await pool.query(
      'SELECT password_hash FROM empresas WHERE id = ?',
      [req.empresa.id]
    );

    const ok = await bcrypt.compare(password_actual, rows[0].password_hash);
    if (!ok)
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta.' });

    const nuevo_hash = await bcrypt.hash(password_nuevo, 10);
    await pool.query(
      'UPDATE empresas SET password_hash = ? WHERE id = ?',
      [nuevo_hash, req.empresa.id]
    );

    return res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('[cambiarPassword]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}