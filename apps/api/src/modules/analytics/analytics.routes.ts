import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { getMyDashboardAnalyticsController } from "./analytics.controller";

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth);

analyticsRoutes.get("/dashboard", getMyDashboardAnalyticsController);
