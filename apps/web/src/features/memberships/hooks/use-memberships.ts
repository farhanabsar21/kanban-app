import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembers } from "../api/membership-api";

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: () => getWorkspaceMembers(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}
