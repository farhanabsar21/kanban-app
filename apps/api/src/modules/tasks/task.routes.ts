import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "./task.schema";
import {
  createTaskController,
  deleteTaskController,
  getTaskByIdController,
  moveTaskController,
  updateTaskController,
} from "./task.controller";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.post("/", validateRequest(createTaskSchema), createTaskController);
taskRoutes.get("/:taskId", getTaskByIdController);

taskRoutes.patch(
  "/:taskId",
  validateRequest(updateTaskSchema),
  updateTaskController,
);

taskRoutes.patch(
  "/:taskId/move",
  validateRequest(moveTaskSchema),
  moveTaskController,
);

taskRoutes.delete("/:taskId", deleteTaskController);
