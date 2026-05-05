import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required").max(40),
  color: z.string().optional(),
});

export type CreateLabelFormValues = z.infer<typeof createLabelSchema>;
