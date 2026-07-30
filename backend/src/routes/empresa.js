// src/routes/empresa.js
import { Router }                        from 'express';
import { requireAuth }                   from '../middleware/auth.js';
import { miPerfil, actualizarPerfil, cambiarPassword } from '../controllers/empresaController.js';

export const empresaRouter = Router();

empresaRouter.get  ('/perfil',           requireAuth, miPerfil);
empresaRouter.patch('/perfil',           requireAuth, actualizarPerfil);
empresaRouter.patch('/cambiar-password', requireAuth, cambiarPassword);