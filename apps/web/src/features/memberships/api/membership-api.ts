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

export type AddWorkspaceMemberInput = {
  workspaceId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export type UpdateWorkspaceMemberRoleInput = {
  workspaceId: string;
  memberId: string;
  role: "ADMIN" | "MEMBER";
};

export type RemoveWorkspaceMemberInput = {
  workspaceId: string;
  memberId: string;
};

export async function getWorkspaceMembers(workspaceId: string) {
  const res = await apiClient.get<{ members: WorkspaceMember[] }>(
    `/memberships/workspaces/${workspaceId}/members`,
  );

  return res.data;
}

export async function addWorkspaceMember(input: AddWorkspaceMemberInput) {
  const res = await apiClient.post<{ member: WorkspaceMember }>(
    `/memberships/workspaces/${input.workspaceId}/members`,
    {
      email: input.email,
      role: input.role,
    },
  );

  return res.data;
}

export async function updateWorkspaceMemberRole(
  input: UpdateWorkspaceMemberRoleInput,
) {
  const res = await apiClient.patch<{ member: WorkspaceMember }>(
    `/memberships/workspaces/${input.workspaceId}/members/${input.memberId}/role`,
    {
      role: input.role,
    },
  );

  return res.data;
}

export async function removeWorkspaceMember(input: RemoveWorkspaceMemberInput) {
  const res = await apiClient.delete<{ success: boolean }>(
    `/memberships/workspaces/${input.workspaceId}/members/${input.memberId}`,
  );

  return res.data;
}
