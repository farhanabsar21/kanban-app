import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  type CreateBoardInput,
  getWorkspaceBoards,
} from "../api/board-api";

export function useWorkspaceBoards(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "boards"],
    queryFn: () => getWorkspaceBoards(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => createBoard(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", variables.workspaceId, "boards"],
      });
    },
  });
}
