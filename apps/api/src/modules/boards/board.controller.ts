import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { createBoard, getBoardById, getWorkspaceBoards } from "./board.service";

export const createBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const board = await createBoard(req.userId!, req.body);

    res.status(201).json({
      board,
    });
  },
);

export const getWorkspaceBoardsController = asyncHandler(
  async (req: Request, res: Response) => {
    const boards = await getWorkspaceBoards(
      req.userId!,
      req.params.workspaceId as string,
    );

    res.status(200).json({
      boards,
    });
  },
);

export const getBoardByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const board = await getBoardById(req.userId!, req.params.boardId as string);

    res.status(200).json({
      board,
    });
  },
);
