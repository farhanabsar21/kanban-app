import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";

async function ensureTaskMember(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
    },
    select: {
      id: true,
      boardId: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
}

async function ensureBoardMember(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: {
        members: {
          some: { userId },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  return board;
}

export async function getTaskActivities(userId: string, taskId: string) {
  await ensureTaskMember(userId, taskId);

  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function getBoardActivities(userId: string, boardId: string) {
  await ensureBoardMember(userId, boardId);

  return prisma.activityLog.findMany({
    where: {
      task: {
        boardId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          columnId: true,
        },
      },
    },
  });
}
