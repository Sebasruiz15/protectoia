// src/controllers/authController.js
import bcrypt       from 'bcryptjs';
import jwt          from 'jsonwebtoken';
import { pool }     from '../db/pool.js';

// ── Utilidades ────────────────────────────────────────────────────
const generarOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generarToken = (empresa) =>
  jwt.sign(
    { id: empresa.id, email: empresa.email, rol: empresa.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const empresaPublica = (e) => ({
  id:           e.id,
  razon_social: e.razon_social,
  nit:          e.nit,
  tipo_isp:     e.tipo_isp,
  email:        e.email,
  telefono:     e.telefono,
  rep_legal:    e.rep_legal,
  cargo_rep:    e.cargo_rep,
  municipio:    e.municipio,
  rol:          e.rol,
  estado:       e.estado,
});

// ── Login ─────────────────────────────────────────────────────────
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos.' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM empresas WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    const empresa = rows[0];

    if (!empresa)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });

    if (empresa.estado === 'pendiente')
      return res.status(403).json({
        mensaje:    'Cuenta pendiente de verificación.',
        empresa_id: empresa.id,
      });

    if (empresa.estado === 'inactivo')
      return res.status(403).json({ mensaje: 'Cuenta inactiva. Contacta al administrador.' });

    const passwordOk = await bcrypt.compare(password, empresa.password_hash);
    if (!passwordOk)
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });

    return res.json({
      token:   generarToken(empresa),
      empresa: empresaPublica(empresa),
    });

  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Registro ──────────────────────────────────────────────────────
export async function registro(req, res) {
  const {
    razon_social, nit, tipo_isp, email,
    telefono, rep_legal, cargo_rep, password,
  } = req.body;

  if (!razon_social || !nit || !tipo_isp || !email || !rep_legal || !password)
    return res.status(400).json({ mensaje: 'Todos los campos obligatorios son requeridos.' });

  try {
    // Verificar duplicados
    const [existe] = await pool.query(
      'SELECT id, email, nit FROM empresas WHERE email = ? OR nit = ?',
      [email.toLowerCase().trim(), nit.trim()]
    );

    if (existe.length > 0) {
      const campo = existe[0].email === email.toLowerCase().trim() ? 'email' : 'nit';
      return res.status(409).json({
        mensaje: `Ya existe una empresa con ese ${campo}.`,
        campos:  [{ campo }],
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO empresas
        (razon_social, nit, tipo_isp, email, telefono, rep_legal, cargo_rep, password_hash, rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'empresa', 'pendiente')`,
      [
        razon_social.trim(),
        nit.trim(),
        tipo_isp,
        email.toLowerCase().trim(),
        telefono  ?? null,
        rep_legal.trim(),
        cargo_rep ?? null,
        password_hash,
      ]
    );

    const empresa_id = result.insertId;

    // Generar y guardar OTP
    const codigo     = generarOTP();
    const expires_at = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000);

    await pool.query(
      'INSERT INTO otp_codes (empresa_id, codigo, expires_at) VALUES (?, ?, ?)',
      [empresa_id, codigo, expires_at]
    );

    // En desarrollo mostramos el OTP en consola
    console.log(`[OTP] Empresa ${email} → código: ${codigo}`);

    return res.status(201).json({
      mensaje:    'Empresa registrada. Verifica tu correo.',
      empresa_id,
      email:      email.toLowerCase().trim(),
      // Solo en desarrollo — en producción se envía por email
      ...(process.env.NODE_ENV !== 'production' && { otp_dev: codigo }),
    });

  } catch (err) {
    console.error('[registro]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Verificar OTP ─────────────────────────────────────────────────
export async function verificarOTP(req, res) {
  const { empresa_id, codigo } = req.body;

  if (!empresa_id || !codigo)
    return res.status(400).json({ mensaje: 'empresa_id y codigo son requeridos.' });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE empresa_id = ? AND codigo = ? AND usado = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [empresa_id, codigo]
    );

    if (rows.length === 0)
      return res.status(400).json({ mensaje: 'Código inválido o expirado.' });

    // Marcar OTP como usado
    await pool.query('UPDATE otp_codes SET usado = 1 WHERE id = ?', [rows[0].id]);

    // Activar empresa
    await pool.query(
      "UPDATE empresas SET estado = 'activo' WHERE id = ?",
      [empresa_id]
    );

    const [empresaRows] = await pool.query(
      'SELECT * FROM empresas WHERE id = ?',
      [empresa_id]
    );

    const empresa = empresaRows[0];

    return res.json({
      mensaje: 'Cuenta verificada exitosamente.',
      token:   generarToken(empresa),
      empresa: empresaPublica(empresa),
    });

  } catch (err) {
    console.error('[verificarOTP]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

// ── Reenviar OTP ──────────────────────────────────────────────────
export async function reenviarOTP(req, res) {
  const { empresa_id } = req.body;

  if (!empresa_id)
    return res.status(400).json({ mensaje: 'empresa_id es requerido.' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM empresas WHERE id = ?',
      [empresa_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ mensaje: 'Empresa no encontrada.' });

    const codigo     = generarOTP();
    const expires_at = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000);

    await pool.query(
      'INSERT INTO otp_codes (empresa_id, codigo, expires_at) VALUES (?, ?, ?)',
      [empresa_id, codigo, expires_at]
    );

    console.log(`[OTP REENVÍO] Empresa ${rows[0].email} → código: ${codigo}`);

    return res.json({
      mensaje: 'Código reenviado.',
      ...(process.env.NODE_ENV !== 'production' && { otp_dev: codigo }),
    });

  } catch (err) {
    console.error('[reenviarOTP]', err.message);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}