import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000),
});

export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;
