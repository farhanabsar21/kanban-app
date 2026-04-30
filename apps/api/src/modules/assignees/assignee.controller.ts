import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  addAssigneeToTask,
  getTaskAssignees,
  removeAssigneeFromTask,
} from "./assignee.service";

export const getTaskAssigneesController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignees = await getTaskAssignees(req.userId!, req.params.taskId);

    res.status(200).json({
      assignees,
    });
  },
);

export const addAssigneeToTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignee = await addAssigneeToTask(
      req.userId!,
      req.params.taskId,
      req.params.userId,
    );

    res.status(201).json({
      assignee,
    });
  },
);

export const removeAssigneeFromTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await removeAssigneeFromTask(
      req.userId!,
      req.params.taskId,
      req.params.userId,
    );

    res.status(200).json(result);
  },
);
