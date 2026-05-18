import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWorkspaceMember,
  type AddWorkspaceMemberInput,
  getWorkspaceMembers,
  removeWorkspaceMember,
  type RemoveWorkspaceMemberInput,
  updateWorkspaceMemberRole,
  type UpdateWorkspaceMemberRoleInput,
} from "../api/membership-api";

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: () => getWorkspaceMembers(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useAddWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddWorkspaceMemberInput) => addWorkspaceMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceMemberRoleInput) =>
      updateWorkspaceMemberRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "members"],
      });
    },
  });
}

export function useRemoveWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveWorkspaceMemberInput) =>
      removeWorkspaceMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });
}
