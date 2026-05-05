import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, type CreateCommentInput } from "../api/comment-api";

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", data.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["boards", data.boardId],
      });
    },
  });
}
