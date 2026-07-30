// src/routes/auth.js
import { Router }                                    from 'express';
import { login, registro, verificarOTP, reenviarOTP } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/login',           login);
authRouter.post('/registro',        registro);
authRouter.post('/verificar',       verificarOTP);
authRouter.post('/reenviar-codigo', reenviarOTP);