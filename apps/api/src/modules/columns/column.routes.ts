import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validateRequest } from "../../common/middleware/validate-request";
import { createColumnSchema, updateColumnSchema } from "./column.schema";
import {
  createColumnController,
  deleteColumnController,
  updateColumnController,
} from "./column.controller";

export const columnRoutes = Router();

columnRoutes.use(requireAuth);

columnRoutes.post(
  "/",
  validateRequest(createColumnSchema),
  createColumnController,
);

columnRoutes.patch(
  "/:columnId",
  validateRequest(updateColumnSchema),
  updateColumnController,
);

columnRoutes.delete("/:columnId", deleteColumnController);
