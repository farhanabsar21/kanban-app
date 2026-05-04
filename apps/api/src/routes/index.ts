import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { workspaceRoutes } from "../modules/workspace/workspace.routes";
import { boardRoutes } from "../modules/boards/board.routes";
import { columnRoutes } from "../modules/columns/column.routes";
import { taskRoutes } from "../modules/tasks/task.routes";
import { commentRoutes } from "../modules/comments/comment.routes";
import { labelRoutes } from "../modules/labels/label.routes";
import { assigneeRoutes } from "../modules/assignees/assignee.routes";
import { membershipRoutes } from "../modules/memberships/membership.routes";
import { activityRoutes } from "../modules/activity/activity.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/workspaces", workspaceRoutes);
apiRouter.use("/boards", boardRoutes);
apiRouter.use("/columns", columnRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/comments", commentRoutes);
apiRouter.use("/labels", labelRoutes);
apiRouter.use("/assignees", assigneeRoutes);
apiRouter.use("/memberships", membershipRoutes);
apiRouter.use("/activity", activityRoutes);
