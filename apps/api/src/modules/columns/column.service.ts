import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import {
  CreateColumnInput,
  ReorderColumnsInput,
  UpdateColumnInput,
} from "./column.schema";

async function ensureBoardMember(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  return board;
}

async function ensureColumnMember(userId: string, columnId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      boardId: true,
      position: true,
    },
  });

  if (!column) {
    throw new AppError("Column not found", 404);
  }

  return column;
}

export async function createColumn(userId: string, input: CreateColumnInput) {
  await ensureBoardMember(userId, input.boardId);

  const lastColumn = await prisma.column.findFirst({
    where: {
      boardId: input.boardId,
    },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  const nextPosition = lastColumn ? lastColumn.position + 1 : 0;

  return prisma.column.create({
    data: {
      boardId: input.boardId,
      name: input.name,
      position: nextPosition,
    },
  });
}

export async function updateColumn(
  userId: string,
  columnId: string,
  input: UpdateColumnInput,
) {
  await ensureColumnMember(userId, columnId);

  return prisma.column.update({
    where: {
      id: columnId,
    },
    data: {
      name: input.name,
    },
  });
}

export async function deleteColumn(userId: string, columnId: string) {
  const column = await ensureColumnMember(userId, columnId);

  const taskCount = await prisma.task.count({
    where: {
      columnId,
    },
  });

  if (taskCount > 0) {
    throw new AppError("Cannot delete a column that contains tasks", 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.column.delete({
      where: {
        id: columnId,
      },
    });

    const remainingColumns = await tx.column.findMany({
      where: {
        boardId: column.boardId,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      remainingColumns.map((item, index) =>
        tx.column.update({
          where: {
            id: item.id,
          },
          data: {
            position: index,
          },
        }),
      ),
    );
  });

  return {
    success: true,
  };
}

export async function reorderColumns(
  userId: string,
  boardId: string,
  input: ReorderColumnsInput,
) {
  await ensureBoardMember(userId, boardId);

  const columns = await prisma.column.findMany({
    where: {
      boardId,
    },
    select: {
      id: true,
    },
  });

  const existingIds = new Set(columns.map((column) => column.id));

  const isSameLength = input.columnIds.length === columns.length;
  const allIdsExist = input.columnIds.every((id) => existingIds.has(id));

  if (!isSameLength || !allIdsExist) {
    throw new AppError("Invalid column order", 400);
  }

  await prisma.$transaction(
    input.columnIds.map((columnId, index) =>
      prisma.column.update({
        where: {
          id: columnId,
        },
        data: {
          position: index,
        },
      }),
    ),
  );

  return prisma.column.findMany({
    where: {
      boardId,
    },
    orderBy: {
      position: "asc",
    },
  });
}
