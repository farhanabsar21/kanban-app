import { apiClient } from "../../../lib/api-client";

export type Board = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    columns: number;
    tasks: number;
  };
};

export type CreateBoardInput = {
  workspaceId: string;
  name: string;
  description?: string;
};

export async function getWorkspaceBoards(workspaceId: string) {
  const res = await apiClient.get<{ boards: Board[] }>(
    `/workspaces/${workspaceId}/boards`,
  );

  return res.data;
}

export async function createBoard(input: CreateBoardInput) {
  const res = await apiClient.post<{ board: Board }>("/boards", input);
  return res.data;
}
