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

export async function createTask(input: CreateTaskInput) {
  const res = await apiClient.post<{ task: BoardTask }>("/tasks", input);
  return res.data;
}
