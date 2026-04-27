import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { workspaceRoutes } from "../modules/workspace/workspace.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/workspaces", workspaceRoutes);
