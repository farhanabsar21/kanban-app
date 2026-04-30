import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createBoardSchema } from "./board.schema";
import {
  createBoardController,
  getBoardByIdController,
} from "./board.controller";
import { reorderColumnsSchema } from "../columns/column.schema";
import { reorderColumnsController } from "../columns/column.controller";

export const boardRoutes = Router();

boardRoutes.use(requireAuth);

boardRoutes.post(
  "/",
  validateRequest(createBoardSchema),
  createBoardController,
);

boardRoutes.patch(
  "/:boardId/columns/reorder",
  validateRequest(reorderColumnsSchema),
  reorderColumnsController,
);

boardRoutes.get("/:boardId", getBoardByIdController);
