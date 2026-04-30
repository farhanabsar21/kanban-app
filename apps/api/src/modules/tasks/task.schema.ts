import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    boardId: z.string().min(1),
    columnId: z.string().min(1),
    title: z.string().min(2).max(200),
    description: z.string().max(5000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    targetColumnId: z.string().min(1),
    targetPosition: z.number().int().min(0),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type MoveTaskInput = z.infer<typeof moveTaskSchema>["body"];
