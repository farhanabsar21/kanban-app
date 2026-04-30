import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  createTask,
  deleteTask,
  getTaskById,
  moveTask,
  updateTask,
} from "./task.service";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await createTask(req.userId!, req.body);

    res.status(201).json({
      task,
    });
  },
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await getTaskById(req.userId!, req.params.taskId);

    res.status(200).json({
      task,
    });
  },
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await updateTask(req.userId!, req.params.taskId, req.body);

    res.status(200).json({
      task,
    });
  },
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteTask(req.userId!, req.params.taskId);

    res.status(200).json(result);
  },
);

export const moveTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const task = await moveTask(req.userId!, req.params.taskId, req.body);

    res.status(200).json({
      task,
    });
  },
);
