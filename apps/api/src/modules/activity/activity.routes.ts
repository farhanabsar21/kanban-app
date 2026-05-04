import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import {
  getBoardActivitiesController,
  getTaskActivitiesController,
} from "./activity.controller";

export const activityRoutes = Router();

activityRoutes.use(requireAuth);

activityRoutes.get("/tasks/:taskId/activities", getTaskActivitiesController);

activityRoutes.get("/boards/:boardId/activities", getBoardActivitiesController);
