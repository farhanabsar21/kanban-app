import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(2, "Column name must be at least 2 characters"),
});

export type CreateColumnFormValues = z.infer<typeof createColumnSchema>;
