import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  createColumn,
  deleteColumn,
  reorderColumns,
  updateColumn,
} from "./column.service";

export const createColumnController = asyncHandler(
  async (req: Request, res: Response) => {
    const column = await createColumn(req.userId!, req.body);

    res.status(201).json({
      column,
    });
  },
);

export const updateColumnController = asyncHandler(
  async (req: Request, res: Response) => {
    const column = await updateColumn(
      req.userId!,
      req.params.columnId,
      req.body,
    );

    res.status(200).json({
      column,
    });
  },
);

export const deleteColumnController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteColumn(req.userId!, req.params.columnId);

    res.status(200).json(result);
  },
);

export const reorderColumnsController = asyncHandler(
  async (req: Request, res: Response) => {
    const columns = await reorderColumns(
      req.userId!,
      req.params.boardId,
      req.body,
    );

    res.status(200).json({
      columns,
    });
  },
);
