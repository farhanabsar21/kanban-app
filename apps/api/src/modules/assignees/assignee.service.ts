import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";

async function ensureTaskMember(currentUserId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        workspace: {
          members: {
            some: {
              userId: currentUserId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      boardId: true,
      board: {
        select: {
          workspaceId: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
}

async function ensureUserIsWorkspaceMember(
  userId: string,
  workspaceId: string,
) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!membership) {
    throw new AppError("User is not a workspace member", 400);
  }

  return membership;
}

export async function getTaskAssignees(currentUserId: string, taskId: string) {
  await ensureTaskMember(currentUserId, taskId);

  return prisma.taskAssignee.findMany({
    where: {
      taskId,
    },
    orderBy: {
      assignedAt: "asc",
    },
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
  });
}

export async function addAssigneeToTask(
  currentUserId: string,
  taskId: string,
  userIdToAssign: string,
) {
  const task = await ensureTaskMember(currentUserId, taskId);

  const membership = await ensureUserIsWorkspaceMember(
    userIdToAssign,
    task.board.workspaceId,
  );

  return prisma.$transaction(async (tx) => {
    const assignee = await tx.taskAssignee.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: userIdToAssign,
        },
      },
      update: {},
      create: {
        taskId,
        userId: userIdToAssign,
      },
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
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: currentUserId,
        action: "ASSIGNEE_ADDED",
        metadata: {
          userId: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
        },
      },
    });

    return assignee;
  });
}

export async function removeAssigneeFromTask(
  currentUserId: string,
  taskId: string,
  userIdToRemove: string,
) {
  const task = await ensureTaskMember(currentUserId, taskId);

  const membership = await ensureUserIsWorkspaceMember(
    userIdToRemove,
    task.board.workspaceId,
  );

  const existing = await prisma.taskAssignee.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId: userIdToRemove,
      },
    },
  });

  if (!existing) {
    throw new AppError("User is not assigned to this task", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: userIdToRemove,
        },
      },
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: currentUserId,
        action: "ASSIGNEE_REMOVED",
        metadata: {
          userId: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
        },
      },
    });
  });

  return {
    success: true,
  };
}
