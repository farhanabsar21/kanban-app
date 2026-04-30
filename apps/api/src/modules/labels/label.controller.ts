import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  addLabelToTask,
  createLabel,
  deleteLabel,
  getWorkspaceLabels,
  removeLabelFromTask,
  updateLabel,
} from "./label.service";

export const createLabelController = asyncHandler(
  async (req: Request, res: Response) => {
    const label = await createLabel(req.userId!, req.body);

    res.status(201).json({
      label,
    });
  },
);

export const getWorkspaceLabelsController = asyncHandler(
  async (req: Request, res: Response) => {
    const labels = await getWorkspaceLabels(
      req.userId!,
      req.params.workspaceId,
    );

    res.status(200).json({
      labels,
    });
  },
);

export const updateLabelController = asyncHandler(
  async (req: Request, res: Response) => {
    const label = await updateLabel(req.userId!, req.params.labelId, req.body);

    res.status(200).json({
      label,
    });
  },
);

export const deleteLabelController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteLabel(req.userId!, req.params.labelId);

    res.status(200).json(result);
  },
);

export const addLabelToTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const taskLabel = await addLabelToTask(
      req.userId!,
      req.params.taskId,
      req.params.labelId,
    );

    res.status(201).json({
      taskLabel,
    });
  },
);

export const removeLabelFromTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await removeLabelFromTask(
      req.userId!,
      req.params.taskId,
      req.params.labelId,
    );

    res.status(200).json(result);
  },
);
