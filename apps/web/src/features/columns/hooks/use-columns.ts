import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColumn, type CreateColumnInput } from "../api/column-api";

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateColumnInput) => createColumn(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards", variables.boardId],
      });
    },
  });
}
