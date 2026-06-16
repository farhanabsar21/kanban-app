import { apiClient } from "../../../lib/api-client";

export type DashboardAnalytics = {
  totalWorkspaces: number;
  totalBoards: number;
  totalMembers: number;
  totalTasks: number;
  overdueTasks: number;
};

export async function getDashboardAnalytics() {
  const res = await apiClient.get<{ analytics: DashboardAnalytics }>(
    "/analytics/dashboard",
  );

  return res.data;
}
