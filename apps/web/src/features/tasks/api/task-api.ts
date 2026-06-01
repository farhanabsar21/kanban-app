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
  activities: {
    id: string;
    taskId: string;
    actorId: string;
    action:
      | "TASK_CREATED"
      | "TASK_UPDATED"
      | "TASK_MOVED"
      | "COMMENT_ADDED"
      | "ASSIGNEE_ADDED"
      | "ASSIGNEE_REMOVED"
      | "LABEL_ADDED"
      | "LABEL_REMOVED";
    metadata: Record<string, unknown> | null;
    createdAt: string;
    actor: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }[];
};

export type UpdateTaskInput = {
  taskId: string;
  boardId: string;
  title?: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
};

export type MoveTaskInput = {
  taskId: string;
  boardId: string;
  targetColumnId: string;
  targetPosition: number;
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

export async function moveTask(input: MoveTaskInput) {
  const res = await apiClient.patch<{ task: BoardTask }>(
    `/tasks/${input.taskId}/move`,
    {
      targetColumnId: input.targetColumnId,
      targetPosition: input.targetPosition,
    },
  );

  return {
    ...res.data,
    boardId: input.boardId,
  };
}

export type DeleteTaskInput = {
  taskId: string;
  boardId: string;
};

export async function deleteTask(input: DeleteTaskInput) {
  const res = await apiClient.delete<{ success: boolean }>(
    `/tasks/${input.taskId}`,
  );

  return {
    ...res.data,
    boardId: input.boardId,
  };
}
