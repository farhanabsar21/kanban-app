import { apiClient } from "../../../lib/api-client";

export type CommentAuthor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type TaskComment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
};

export type CreateCommentInput = {
  taskId: string;
  boardId: string;
  body: string;
};

export async function createComment(input: CreateCommentInput) {
  const res = await apiClient.post<{ comment: TaskComment }>(
    `/comments/tasks/${input.taskId}/comments`,
    { body: input.body },
  );

  return {
    ...res.data,
    taskId: input.taskId,
    boardId: input.boardId,
  };
}
