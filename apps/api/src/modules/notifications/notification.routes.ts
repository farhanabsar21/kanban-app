import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import {
  getMyNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./notification.controller";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get("/", getMyNotificationsController);
notificationRoutes.get("/unread-count", getUnreadNotificationCountController);
notificationRoutes.patch(
  "/:notificationId/read",
  markNotificationAsReadController,
);
notificationRoutes.patch(
  "/mark-all-read",
  markAllNotificationsAsReadController,
);
