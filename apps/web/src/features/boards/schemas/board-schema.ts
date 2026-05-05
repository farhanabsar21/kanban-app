import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(2, "Board name must be at least 2 characters"),
  description: z.string().max(500).optional(),
});

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
