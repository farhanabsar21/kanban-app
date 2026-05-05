import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAssigneeToTask, removeAssigneeFromTask } from "../api/assignee-api";

export function useAddAssigneeToTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => addAssigneeToTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}

export function useRemoveAssigneeFromTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeAssigneeFromTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}
