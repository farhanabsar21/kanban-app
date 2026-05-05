import { apiClient } from "../../../lib/api-client";
import { type BoardColumn } from "../../boards/api/board-api";

export type CreateColumnInput = {
  boardId: string;
  name: string;
};

export async function createColumn(input: CreateColumnInput) {
  const res = await apiClient.post<{ column: BoardColumn }>("/columns", input);
  return res.data;
}
