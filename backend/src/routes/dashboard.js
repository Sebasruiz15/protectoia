// src/routes/dashboard.js
import { Router }                              from 'express';
import { requireAuth, requireAdmin }           from '../middleware/auth.js';
import { dashboardEmpresa, dashboardAdmin }    from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

dashboardRouter.get('/empresa', requireAuth,              dashboardEmpresa);
dashboardRouter.get('/admin',   requireAuth, requireAdmin, dashboardAdmin);