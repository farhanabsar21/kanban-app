import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachLabelToTask,
  createLabel,
  getWorkspaceLabels,
  removeLabelFromTask,
} from "../api/label-api";

export function useWorkspaceLabels(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "labels"],
    queryFn: () => getWorkspaceLabels(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useAttachLabelToTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => attachLabelToTask(taskId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}

export function useRemoveLabelFromTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => removeLabelFromTask(taskId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}

export function useCreateLabel(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "labels"],
      });
    },
  });
}
