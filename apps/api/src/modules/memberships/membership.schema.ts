import { z } from "zod";

export const addWorkspaceMemberSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "MEMBER"]),
  }),
});

export type AddWorkspaceMemberInput = z.infer<
  typeof addWorkspaceMemberSchema
>["body"];

export type UpdateWorkspaceMemberRoleInput = z.infer<
  typeof updateWorkspaceMemberRoleSchema
>["body"];
