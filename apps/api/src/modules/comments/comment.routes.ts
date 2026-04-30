import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createCommentSchema, updateCommentSchema } from "./comment.schema";
import {
  createCommentController,
  deleteCommentController,
  getTaskCommentsController,
  updateCommentController,
} from "./comment.controller";

export const commentRoutes = Router();

commentRoutes.use(requireAuth);

// task-scoped
commentRoutes.post(
  "/tasks/:taskId/comments",
  validateRequest(createCommentSchema),
  createCommentController,
);

commentRoutes.get("/tasks/:taskId/comments", getTaskCommentsController);

// comment-scoped
commentRoutes.patch(
  "/:commentId",
  validateRequest(updateCommentSchema),
  updateCommentController,
);

commentRoutes.delete("/:commentId", deleteCommentController);
