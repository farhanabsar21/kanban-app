import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getTask,
  moveTask,
  updateTask,
  type CreateTaskInput,
  type DeleteTaskInput,
  type MoveTaskInput,
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

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MoveTaskInput) => moveTask(input),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["boards", variables.boardId],
      });

      const previousBoard = queryClient.getQueryData<{
        board: {
          columns: {
            id: string;
            tasks: {
              id: string;
              columnId: string;
              position: number;
              [key: string]: unknown;
            }[];
            [key: string]: unknown;
          }[];
          [key: string]: unknown;
        };
      }>(["boards", variables.boardId]);

      queryClient.setQueryData(
        ["boards", variables.boardId],
        (oldData: any) => {
          if (!oldData?.board) return oldData;

          const columns = oldData.board.columns.map((column: any) => ({
            ...column,
            tasks: [...column.tasks],
          }));

          let movedTask: any = null;

          for (const column of columns) {
            const taskIndex = column.tasks.findIndex(
              (task: any) => task.id === variables.taskId,
            );

            if (taskIndex !== -1) {
              movedTask = column.tasks[taskIndex];
              column.tasks.splice(taskIndex, 1);
              break;
            }
          }

          if (!movedTask) return oldData;

          const targetColumn = columns.find(
            (column: any) => column.id === variables.targetColumnId,
          );

          if (!targetColumn) return oldData;

          const nextTask = {
            ...movedTask,
            columnId: variables.targetColumnId,
          };

          targetColumn.tasks.splice(variables.targetPosition, 0, nextTask);

          const normalizedColumns = columns.map((column: any) => ({
            ...column,
            tasks: column.tasks.map((task: any, index: number) => ({
              ...task,
              position: index,
            })),
          }));

          return {
            ...oldData,
            board: {
              ...oldData.board,
              columns: normalizedColumns,
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

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteTaskInput) => deleteTask(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards", data.boardId],
      });

      queryClient.removeQueries({
        queryKey: ["tasks", variables.taskId],
      });
    },
  });
}
