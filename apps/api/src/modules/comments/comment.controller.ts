import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "./comment.service";

export const createCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await createComment(
      req.userId!,
      req.params.taskId,
      req.body,
    );

    res.status(201).json({
      comment,
    });
  },
);

export const getTaskCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const comments = await getTaskComments(req.userId!, req.params.taskId);

    res.status(200).json({
      comments,
    });
  },
);

export const updateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await updateComment(
      req.userId!,
      req.params.commentId,
      req.body,
    );

    res.status(200).json({
      comment,
    });
  },
);

export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteComment(req.userId!, req.params.commentId);

    res.status(200).json(result);
  },
);
