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

export type BoardTask = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks: BoardTask[];
};

export type BoardDetail = Board & {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  columns: BoardColumn[];
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

export async function getBoard(boardId: string) {
  const res = await apiClient.get<{ board: BoardDetail }>(`/boards/${boardId}`);
  return res.data;
}
