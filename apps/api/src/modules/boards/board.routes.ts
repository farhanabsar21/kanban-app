import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createBoardSchema } from "./board.schema";
import {
  createBoardController,
  getBoardByIdController,
} from "./board.controller";

export const boardRoutes = Router();

boardRoutes.use(requireAuth);

boardRoutes.post(
  "/",
  validateRequest(createBoardSchema),
  createBoardController,
);
boardRoutes.get("/:boardId", getBoardByIdController);
