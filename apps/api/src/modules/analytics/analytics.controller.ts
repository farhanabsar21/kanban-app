import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { getMyDashboardAnalytics } from "./analytics.service";

export const getMyDashboardAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await getMyDashboardAnalytics(req.userId!);

    res.status(200).json({ analytics });
  },
);
