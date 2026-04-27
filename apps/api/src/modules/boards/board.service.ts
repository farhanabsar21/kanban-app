import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { CreateBoardInput } from "./board.schema";

async function ensureWorkspaceMember(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!membership) {
    throw new AppError("Workspace not found", 404);
  }

  return membership;
}

export async function createBoard(userId: string, input: CreateBoardInput) {
  await ensureWorkspaceMember(userId, input.workspaceId);

  return prisma.board.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
    },
    include: {
      columns: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

export async function getWorkspaceBoards(userId: string, workspaceId: string) {
  await ensureWorkspaceMember(userId, workspaceId);

  return prisma.board.findMany({
    where: {
      workspaceId,
    },
    include: {
      _count: {
        select: {
          columns: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBoardById(userId: string, boardId: string) {
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
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      columns: {
        orderBy: {
          position: "asc",
        },
        include: {
          tasks: {
            orderBy: {
              position: "asc",
            },
            include: {
              assignees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
              labels: {
                include: {
                  label: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  return board;
}
