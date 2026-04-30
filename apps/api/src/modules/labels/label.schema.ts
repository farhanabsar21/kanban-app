import { z } from "zod";

export const createLabelSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    name: z.string().min(1).max(40),
    color: z.string().max(30).optional(),
  }),
});

export const updateLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(40).optional(),
    color: z.string().max(30).nullable().optional(),
  }),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>["body"];
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>["body"];
