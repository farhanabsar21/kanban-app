import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { CreateLabelInput, UpdateLabelInput } from "./label.schema";

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

async function ensureLabelMember(userId: string, labelId: string) {
  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
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
      name: true,
      color: true,
    },
  });

  if (!label) {
    throw new AppError("Label not found", 404);
  }

  return label;
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

export async function createLabel(userId: string, input: CreateLabelInput) {
  await ensureWorkspaceMember(userId, input.workspaceId);

  return prisma.label.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      color: input.color,
    },
  });
}

export async function getWorkspaceLabels(userId: string, workspaceId: string) {
  await ensureWorkspaceMember(userId, workspaceId);

  return prisma.label.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updateLabel(
  userId: string,
  labelId: string,
  input: UpdateLabelInput,
) {
  await ensureLabelMember(userId, labelId);

  return prisma.label.update({
    where: {
      id: labelId,
    },
    data: {
      name: input.name,
      color: input.color,
    },
  });
}

export async function deleteLabel(userId: string, labelId: string) {
  await ensureLabelMember(userId, labelId);

  await prisma.label.delete({
    where: {
      id: labelId,
    },
  });

  return {
    success: true,
  };
}

export async function addLabelToTask(
  userId: string,
  taskId: string,
  labelId: string,
) {
  const task = await ensureTaskMember(userId, taskId);
  const label = await ensureLabelMember(userId, labelId);

  if (task.board.workspaceId !== label.workspaceId) {
    throw new AppError("Label does not belong to this task workspace", 400);
  }

  return prisma.$transaction(async (tx) => {
    const taskLabel = await tx.taskLabel.upsert({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
      update: {},
      create: {
        taskId,
        labelId,
      },
      include: {
        label: true,
      },
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: userId,
        action: "LABEL_ADDED",
        metadata: {
          labelId,
          labelName: label.name,
        },
      },
    });

    return taskLabel;
  });
}

export async function removeLabelFromTask(
  userId: string,
  taskId: string,
  labelId: string,
) {
  const task = await ensureTaskMember(userId, taskId);
  const label = await ensureLabelMember(userId, labelId);

  if (task.board.workspaceId !== label.workspaceId) {
    throw new AppError("Label does not belong to this task workspace", 400);
  }

  const existing = await prisma.taskLabel.findUnique({
    where: {
      taskId_labelId: {
        taskId,
        labelId,
      },
    },
  });

  if (!existing) {
    throw new AppError("Label is not attached to this task", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: userId,
        action: "LABEL_REMOVED",
        metadata: {
          labelId,
          labelName: label.name,
        },
      },
    });
  });

  return {
    success: true,
  };
}
