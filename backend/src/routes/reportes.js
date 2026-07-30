// src/routes/reportes.js
import { Router }          from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  guardarT12,
  misReportesT12,
  verReporteT12,
  todosReportesT12,
  actualizarEstadoT12,
  todasEmpresas,
  detalleEmpresa,
} from '../controllers/reportesController.js';

export const reportesRouter = Router();

// ── Rutas empresa ─────────────────────────────────────────────────
reportesRouter.post('/t12',         requireAuth, guardarT12);
reportesRouter.get ('/t12',         requireAuth, misReportesT12);
reportesRouter.get ('/t12/:id',     requireAuth, verReporteT12);

// ── Rutas admin ───────────────────────────────────────────────────
reportesRouter.get   ('/admin/t12',          requireAuth, requireAdmin, todosReportesT12);
reportesRouter.patch ('/admin/t12/:id',      requireAuth, requireAdmin, actualizarEstadoT12);
reportesRouter.get   ('/admin/empresas',     requireAuth, requireAdmin, todasEmpresas);
reportesRouter.get   ('/admin/empresas/:id', requireAuth, requireAdmin, detalleEmpresa);