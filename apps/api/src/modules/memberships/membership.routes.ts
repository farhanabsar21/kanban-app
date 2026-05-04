import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import {
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
} from "./membership.schema";
import {
  addWorkspaceMemberController,
  getWorkspaceMembersController,
  removeWorkspaceMemberController,
  updateWorkspaceMemberRoleController,
} from "./membership.controller";

export const membershipRoutes = Router();

membershipRoutes.use(requireAuth);

membershipRoutes.get(
  "/workspaces/:workspaceId/members",
  getWorkspaceMembersController,
);

membershipRoutes.post(
  "/workspaces/:workspaceId/members",
  validateRequest(addWorkspaceMemberSchema),
  addWorkspaceMemberController,
);

membershipRoutes.patch(
  "/workspaces/:workspaceId/members/:memberId/role",
  validateRequest(updateWorkspaceMemberRoleSchema),
  updateWorkspaceMemberRoleController,
);

membershipRoutes.delete(
  "/workspaces/:workspaceId/members/:memberId",
  removeWorkspaceMemberController,
);
