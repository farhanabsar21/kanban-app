import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createLabelSchema, updateLabelSchema } from "./label.schema";
import {
  addLabelToTaskController,
  createLabelController,
  deleteLabelController,
  getWorkspaceLabelsController,
  removeLabelFromTaskController,
  updateLabelController,
} from "./label.controller";

export const labelRoutes = Router();

labelRoutes.use(requireAuth);

labelRoutes.post(
  "/",
  validateRequest(createLabelSchema),
  createLabelController,
);

labelRoutes.get(
  "/workspaces/:workspaceId/labels",
  getWorkspaceLabelsController,
);

labelRoutes.patch(
  "/:labelId",
  validateRequest(updateLabelSchema),
  updateLabelController,
);

labelRoutes.delete("/:labelId", deleteLabelController);

labelRoutes.post("/tasks/:taskId/labels/:labelId", addLabelToTaskController);

labelRoutes.delete(
  "/tasks/:taskId/labels/:labelId",
  removeLabelFromTaskController,
);
