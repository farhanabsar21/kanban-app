import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumn,
  deleteColumn,
  reorderColumns,
  updateColumn,
  type CreateColumnInput,
  type DeleteColumnInput,
  type ReorderColumnsInput,
  type UpdateColumnInput,
} from "../api/column-api";

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

export function useReorderColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReorderColumnsInput) => reorderColumns(input),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["boards", variables.boardId],
      });

      const previousBoard = queryClient.getQueryData([
        "boards",
        variables.boardId,
      ]);

      queryClient.setQueryData(
        ["boards", variables.boardId],
        (oldData: any) => {
          if (!oldData?.board) return oldData;

          const columnMap = new Map(
            oldData.board.columns.map((column: any) => [column.id, column]),
          );

          const reorderedColumns = variables.columnIds
            .map((columnId, index) => {
              const column = columnMap.get(columnId);
              if (!column) return null;

              return {
                ...column,
                position: index,
              };
            })
            .filter(Boolean);

          return {
            ...oldData,
            board: {
              ...oldData.board,
              columns: reorderedColumns,
            },
          };
        },
      );

      return { previousBoard };
    },

    onError: (_error, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          ["boards", variables.boardId],
          context.previousBoard,
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards", variables.boardId],
      });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateColumnInput) => updateColumn(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards", data.boardId] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteColumnInput) => deleteColumn(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards", data.boardId] });
    },
  });
}
