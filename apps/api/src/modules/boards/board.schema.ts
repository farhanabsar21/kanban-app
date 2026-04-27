import { z } from "zod";

export const createBoardSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
  }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>["body"];
