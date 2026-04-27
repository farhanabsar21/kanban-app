import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
  }),
});

export type CreateWorkspaceInput = z.infer<
  typeof createWorkspaceSchema
>["body"];
