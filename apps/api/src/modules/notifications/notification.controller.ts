import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.service";

export const getMyNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await getMyNotifications(req.userId!);
    res.status(200).json({ notifications });
  },
);

export const getUnreadNotificationCountController = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await getUnreadNotificationCount(req.userId!);
    res.status(200).json({ count });
  },
);

export const markNotificationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await markNotificationAsRead(
      req.userId!,
      req.params.notificationId,
    );

    res.status(200).json({ notification });
  },
);

export const markAllNotificationsAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await markAllNotificationsAsRead(req.userId!);
    res.status(200).json(result);
  },
);
