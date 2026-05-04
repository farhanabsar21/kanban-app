import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  addWorkspaceMember,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "./membership.service";

export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const members = await getWorkspaceMembers(
      req.userId!,
      req.params.workspaceId,
    );

    res.status(200).json({ members });
  },
);

export const addWorkspaceMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const member = await addWorkspaceMember(
      req.userId!,
      req.params.workspaceId,
      req.body,
    );

    res.status(201).json({ member });
  },
);

export const updateWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const member = await updateWorkspaceMemberRole(
      req.userId!,
      req.params.workspaceId,
      req.params.memberId,
      req.body,
    );

    res.status(200).json({ member });
  },
);

export const removeWorkspaceMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await removeWorkspaceMember(
      req.userId!,
      req.params.workspaceId,
      req.params.memberId,
    );

    res.status(200).json(result);
  },
);
