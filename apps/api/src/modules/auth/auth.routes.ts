import { Router } from "express";
import { validateRequest } from "../../common/middleware/validate-request";
import { requireAuth } from "../../common/middleware/require-auth";
import { loginSchema, registerSchema } from "./auth.schema";
import { login, logout, me, register } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest(registerSchema), register);
authRoutes.post("/login", validateRequest(loginSchema), login);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", logout);
