import { z } from "zod";

export const createColumnSchema = z.object({
  body: z.object({
    boardId: z.string().min(1),
    name: z.string().min(2).max(80),
  }),
});

export const updateColumnSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
  }),
});

export const reorderColumnsSchema = z.object({
  body: z.object({
    columnIds: z.array(z.string().min(1)).min(1),
  }),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>["body"];
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>["body"];
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>["body"];
