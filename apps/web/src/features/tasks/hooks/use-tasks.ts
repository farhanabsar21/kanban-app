import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  getTask,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "../api/task-api";

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

export function useTask(taskId?: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => getTask(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["boards", data.boardId],
      });
    },
  });
}
