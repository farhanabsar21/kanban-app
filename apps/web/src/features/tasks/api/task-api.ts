import { apiClient } from "../../../lib/api-client";
import { type BoardTask } from "../../boards/api/board-api";

export type CreateTaskInput = {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
};

export type TaskDetail = BoardTask & {
  assignees: {
    id: string;
    taskId: string;
    userId: string;
    assignedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }[];
  labels: {
    id: string;
    taskId: string;
    labelId: string;
    label: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
  comments: {
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }[];
  activities: unknown[];
};

export type UpdateTaskInput = {
  taskId: string;
  boardId: string;
  title?: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
};

export async function createTask(input: CreateTaskInput) {
  const res = await apiClient.post<{ task: BoardTask }>("/tasks", input);
  return res.data;
}

export async function getTask(taskId: string) {
  const res = await apiClient.get<{ task: TaskDetail }>(`/tasks/${taskId}`);
  return res.data;
}

export async function updateTask(input: UpdateTaskInput) {
  const { taskId, boardId, ...body } = input;

  const res = await apiClient.patch<{ task: BoardTask }>(
    `/tasks/${taskId}`,
    body,
  );

  return {
    ...res.data,
    boardId,
  };
}
