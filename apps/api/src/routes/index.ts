import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { workspaceRoutes } from "../modules/workspace/workspace.routes";
import { boardRoutes } from "../modules/boards/board.routes";
import { columnRoutes } from "../modules/columns/column.routes";
import { taskRoutes } from "../modules/tasks/task.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/workspaces", workspaceRoutes);
apiRouter.use("/boards", boardRoutes);
apiRouter.use("/columns", columnRoutes);
apiRouter.use("/tasks", taskRoutes);
