import { apiClient } from "../../../lib/api-client";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    boards: number;
    members: number;
  };
};

export type CreateWorkspaceInput = {
  name: string;
};

export async function getWorkspaces() {
  const res = await apiClient.get<{ workspaces: Workspace[] }>("/workspaces");
  return res.data;
}

export async function createWorkspace(input: CreateWorkspaceInput) {
  const res = await apiClient.post<{ workspace: Workspace }>(
    "/workspaces",
    input,
  );
  return res.data;
}

export async function getWorkspace(workspaceId: string) {
  const res = await apiClient.get<{ workspace: Workspace }>(
    `/workspaces/${workspaceId}`,
  );

  return res.data;
}
