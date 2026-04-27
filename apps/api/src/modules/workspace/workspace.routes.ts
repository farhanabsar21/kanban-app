import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createWorkspaceSchema } from "./workspace.schema";
import {
  createWorkspaceController,
  getMyWorkspacesController,
  getWorkspaceByIdController,
} from "./workspace.controller";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireAuth);

workspaceRoutes.post(
  "/",
  validateRequest(createWorkspaceSchema),
  createWorkspaceController,
);

workspaceRoutes.get("/", getMyWorkspacesController);

workspaceRoutes.get("/:workspaceId", getWorkspaceByIdController);
