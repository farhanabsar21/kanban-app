import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { getBoardActivities, getTaskActivities } from "./activity.service";

export const getTaskActivitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const activities = await getTaskActivities(req.userId!, req.params.taskId);

    res.status(200).json({ activities });
  },
);

export const getBoardActivitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const activities = await getBoardActivities(
      req.userId!,
      req.params.boardId,
    );

    res.status(200).json({ activities });
  },
);
