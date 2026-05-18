import { apiClient } from "../../../lib/api-client";
import { type BoardColumn } from "../../boards/api/board-api";

export type CreateColumnInput = {
  boardId: string;
  name: string;
};

export type ReorderColumnsInput = {
  boardId: string;
  columnIds: string[];
};

export async function createColumn(input: CreateColumnInput) {
  const res = await apiClient.post<{ column: BoardColumn }>("/columns", input);
  return res.data;
}

export async function reorderColumns(input: ReorderColumnsInput) {
  const res = await apiClient.patch<{ columns: BoardColumn[] }>(
    `/boards/${input.boardId}/columns/reorder`,
    {
      columnIds: input.columnIds,
    },
  );

  return {
    ...res.data,
    boardId: input.boardId,
  };
}
