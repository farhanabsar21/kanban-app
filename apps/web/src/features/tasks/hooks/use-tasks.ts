import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, type CreateTaskInput } from "../api/task-api";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards", variables.boardId],
      });
    },
  });
}
