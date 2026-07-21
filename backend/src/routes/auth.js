// src/routes/auth.js
import express from "express";
import {
  login,
  registro,
  verificarCodigo,
} from "../controllers/authController.js";

export const authRouter = express.Router();

// Rutas de autenticación
authRouter.post("/registro", registro);
authRouter.post("/verificar", verificarCodigo);
authRouter.post("/login", login);
