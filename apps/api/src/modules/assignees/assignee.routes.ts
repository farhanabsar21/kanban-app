import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import {
  addAssigneeToTaskController,
  getTaskAssigneesController,
  removeAssigneeFromTaskController,
} from "./assignee.controller";

export const assigneeRoutes = Router();

assigneeRoutes.use(requireAuth);

assigneeRoutes.get("/tasks/:taskId/assignees", getTaskAssigneesController);

assigneeRoutes.post(
  "/tasks/:taskId/assignees/:userId",
  addAssigneeToTaskController,
);

assigneeRoutes.delete(
  "/tasks/:taskId/assignees/:userId",
  removeAssigneeFromTaskController,
);
