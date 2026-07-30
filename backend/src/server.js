// src/server.js
import express            from 'express';
import cors               from 'cors';
import helmet             from 'helmet';
import morgan             from 'morgan';
import dotenv             from 'dotenv';
import { authRouter }     from './routes/auth.js';
import { reportesRouter } from './routes/reportes.js';
import { dashboardRouter } from './routes/dashboard.js';
import { empresaRouter }  from './routes/empresa.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/reportes',  reportesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/empresa',   empresaRouter);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, servicio: 'Gesco IA API', ts: new Date() })
);

// ── Manejo global de errores ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.',
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Gesco IA API corriendo en http://localhost:${PORT}`)
);