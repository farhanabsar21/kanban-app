import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
} from "./workspace.service";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await createWorkspace(req.userId!, req.body);

    res.status(201).json({
      workspace,
    });
  },
);

export const getMyWorkspacesController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaces = await getMyWorkspaces(req.userId!);

    res.status(200).json({
      workspaces,
    });
  },
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await getWorkspaceById(
      req.userId!,
      req.params.workspaceId as string,
    );

    res.status(200).json({
      workspace,
    });
  },
);
