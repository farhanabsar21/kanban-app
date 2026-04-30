import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from "./task.schema";

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

async function ensureTaskMember(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
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
      columnId: true,
      position: true,
      title: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
}

async function ensureColumnBelongsToBoard(columnId: string, boardId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      boardId,
    },
    select: {
      id: true,
      boardId: true,
    },
  });

  if (!column) {
    throw new AppError("Column not found in this board", 400);
  }

  return column;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  await ensureBoardMember(userId, input.boardId);
  await ensureColumnBelongsToBoard(input.columnId, input.boardId);

  const lastTask = await prisma.task.findFirst({
    where: {
      columnId: input.columnId,
    },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  const nextPosition = lastTask ? lastTask.position + 1 : 0;

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        boardId: input.boardId,
        columnId: input.columnId,
        title: input.title,
        description: input.description,
        priority: input.priority ?? "MEDIUM",
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        position: nextPosition,
      },
    });

    await tx.activityLog.create({
      data: {
        taskId: task.id,
        actorId: userId,
        action: "TASK_CREATED",
        metadata: {
          title: task.title,
        },
      },
    });

    return task;
  });
}

export async function getTaskById(userId: string, taskId: string) {
  await ensureTaskMember(userId, taskId);

  return prisma.task.findUnique({
    where: {
      id: taskId,
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
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      activities: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  await ensureTaskMember(userId, taskId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate:
          input.dueDate === undefined
            ? undefined
            : input.dueDate === null
              ? null
              : new Date(input.dueDate),
      },
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: userId,
        action: "TASK_UPDATED",
        metadata: {
          updatedFields: Object.keys(input),
        },
      },
    });

    return task;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await ensureTaskMember(userId, taskId);

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({
      where: {
        id: taskId,
      },
    });

    const remainingTasks = await tx.task.findMany({
      where: {
        columnId: task.columnId,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      remainingTasks.map((item, index) =>
        tx.task.update({
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

export async function moveTask(
  userId: string,
  taskId: string,
  input: MoveTaskInput,
) {
  const task = await ensureTaskMember(userId, taskId);
  await ensureColumnBelongsToBoard(input.targetColumnId, task.boardId);

  return prisma.$transaction(async (tx) => {
    const sourceColumnId = task.columnId;
    const targetColumnId = input.targetColumnId;
    const isSameColumn = sourceColumnId === targetColumnId;

    const targetTasks = await tx.task.findMany({
      where: {
        columnId: targetColumnId,
        NOT: {
          id: taskId,
        },
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
      },
    });

    const safeTargetPosition = Math.min(
      input.targetPosition,
      targetTasks.length,
    );

    const reorderedTargetTasks = [...targetTasks];
    reorderedTargetTasks.splice(safeTargetPosition, 0, { id: taskId });

    await Promise.all(
      reorderedTargetTasks.map((item, index) =>
        tx.task.update({
          where: {
            id: item.id,
          },
          data: {
            columnId: targetColumnId,
            position: index,
          },
        }),
      ),
    );

    if (!isSameColumn) {
      const sourceTasks = await tx.task.findMany({
        where: {
          columnId: sourceColumnId,
          NOT: {
            id: taskId,
          },
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        sourceTasks.map((item, index) =>
          tx.task.update({
            where: {
              id: item.id,
            },
            data: {
              position: index,
            },
          }),
        ),
      );
    }

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: userId,
        action: "TASK_MOVED",
        metadata: {
          fromColumnId: sourceColumnId,
          toColumnId: targetColumnId,
          targetPosition: safeTargetPosition,
        },
      },
    });

    return tx.task.findUnique({
      where: {
        id: taskId,
      },
    });
  });
}
