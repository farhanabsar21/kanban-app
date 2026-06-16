import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics } from "../api/analytics-api";

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardAnalytics,
  });
}
