// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { enviarCodigoVerificacion } from '../services/emailService.js';

// Genera un código OTP de 6 dígitos
const generarOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Genera el JWT de sesión
const generarToken = (empresa) =>
  jwt.sign(
    { id: empresa.id, email: empresa.email, rol: empresa.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/registro ────────────────────────────────
// Crea la cuenta y envía el OTP al correo
export async function registro(req, res, next) {
  try {
    const { razon_social, nit, email, password, telefono, rep_legal, cargo_rep } = req.body;

    // Verificar si el correo o NIT ya existen
    const { rows: existe } = await pool.query(
      'SELECT id FROM empresas WHERE email = $1 OR nit = $2',
      [email.toLowerCase(), nit]
    );
    if (existe.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una cuenta con ese correo o NIT.',
        campo: existe[0].email === email.toLowerCase() ? 'email' : 'nit',
      });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 12);

    // Insertar empresa (no verificada aún)
    const { rows } = await pool.query(
      `INSERT INTO empresas
         (razon_social, nit, email, password_hash, telefono, rep_legal, cargo_rep)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, razon_social, email, nit, verificado`,
      [razon_social.trim(), nit.trim(), email.toLowerCase(), password_hash,
       telefono, rep_legal, cargo_rep]
    );

    const empresa = rows[0];

    // Crear y guardar el OTP
    const codigo = generarOTP();
    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60_000
    );

    await pool.query(
      `INSERT INTO otp_codigos (empresa_id, codigo, tipo, expira_en)
       VALUES ($1, $2, 'verificacion_email', $3)`,
      [empresa.id, codigo, expiresAt]
    );

    // Enviar correo con el OTP
    await enviarCodigoVerificacion(email, codigo, razon_social.trim());

    res.status(201).json({
      mensaje: 'Cuenta creada. Revisa tu correo para verificar la cuenta.',
      empresa_id: empresa.id,
      email: empresa.email,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/verificar ───────────────────────────────
// Valida el OTP ingresado por el usuario
export async function verificarCodigo(req, res, next) {
  try {
    const { empresa_id, codigo } = req.body;

    // Buscar el OTP válido más reciente
    const { rows } = await pool.query(
      `SELECT id, expira_en, usado
       FROM otp_codigos
       WHERE empresa_id = $1
         AND codigo     = $2
         AND tipo       = 'verificacion_email'
       ORDER BY created_at DESC
       LIMIT 1`,
      [empresa_id, codigo]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Código incorrecto. Inténtalo de nuevo.' });
    }

    const otp = rows[0];

    if (otp.usado) {
      return res.status(400).json({ error: 'Este código ya fue usado.' });
    }

    if (new Date() > new Date(otp.expira_en)) {
      return res.status(400).json({ error: 'El código expiró. Solicita uno nuevo.' });
    }

    // Marcar OTP como usado y activar la cuenta
    await pool.query('UPDATE otp_codigos SET usado = TRUE WHERE id = $1', [otp.id]);
    await pool.query(
      'UPDATE empresas SET verificado = TRUE, updated_at = NOW() WHERE id = $1',
      [empresa_id]
    );

    // Obtener datos de la empresa para generar el token
    const { rows: emp } = await pool.query(
      'SELECT id, razon_social, email, nit, rol FROM empresas WHERE id = $1',
      [empresa_id]
    );

    const token = generarToken(emp[0]);

    res.json({
      mensaje: 'Cuenta verificada correctamente.',
      token,
      empresa: {
        id: emp[0].id,
        razon_social: emp[0].razon_social,
        email: emp[0].email,
        nit: emp[0].nit,
        rol: emp[0].rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/reenviar-codigo ────────────────────────
// Genera un nuevo OTP y lo reenvía
export async function reenviarCodigo(req, res, next) {
  try {
    const { empresa_id } = req.body;

    const { rows } = await pool.query(
      'SELECT email, razon_social, verificado FROM empresas WHERE id = $1',
      [empresa_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }

    if (rows[0].verificado) {
      return res.status(400).json({ error: 'Esta cuenta ya fue verificada.' });
    }

    // Rate limiting simple: no permitir reenvío si hay un OTP activo de menos de 1 minuto
    const { rows: reciente } = await pool.query(
      `SELECT id FROM otp_codigos
       WHERE empresa_id = $1
         AND tipo       = 'verificacion_email'
         AND created_at > NOW() - INTERVAL '1 minute'
         AND usado      = FALSE`,
      [empresa_id]
    );

    if (reciente.length > 0) {
      return res.status(429).json({
        error: 'Espera un momento antes de solicitar otro código.',
      });
    }

    const codigo = generarOTP();
    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60_000
    );

    await pool.query(
      `INSERT INTO otp_codigos (empresa_id, codigo, tipo, expira_en)
       VALUES ($1, $2, 'verificacion_email', $3)`,
      [empresa_id, codigo, expiresAt]
    );

    await enviarCodigoVerificacion(rows[0].email, codigo, rows[0].razon_social);

    res.json({ mensaje: 'Código reenviado. Revisa tu correo.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login ────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM empresas WHERE email = $1 AND activo = TRUE',
      [email.toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const empresa = rows[0];
    const passwordOk = await bcrypt.compare(password, empresa.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    if (!empresa.verificado) {
      return res.status(403).json({
        error: 'Debes verificar tu correo antes de ingresar.',
        empresa_id: empresa.id,
        requiere_verificacion: true,
      });
    }

    const token = generarToken(empresa);

    res.json({
      token,
      empresa: {
        id: empresa.id,
        razon_social: empresa.razon_social,
        email: empresa.email,
        nit: empresa.nit,
        rol: empresa.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}
