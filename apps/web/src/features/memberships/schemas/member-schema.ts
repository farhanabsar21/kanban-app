import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
