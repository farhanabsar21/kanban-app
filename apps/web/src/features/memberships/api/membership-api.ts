import { apiClient } from "../../../lib/api-client";

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

export async function getWorkspaceMembers(workspaceId: string) {
  const res = await apiClient.get<{ members: WorkspaceMember[] }>(
    `/memberships/workspaces/${workspaceId}/members`,
  );

  return res.data;
}
