import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { CreateCommentInput, UpdateCommentInput } from "./comment.schema";

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
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
}

async function ensureCommentOwner(userId: string, commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      authorId: true,
      taskId: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (comment.authorId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return comment;
}

export async function createComment(
  userId: string,
  taskId: string,
  input: CreateCommentInput,
) {
  await ensureTaskMember(userId, taskId);

  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        taskId,
        authorId: userId,
        body: input.body,
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
    });

    await tx.activityLog.create({
      data: {
        taskId,
        actorId: userId,
        action: "COMMENT_ADDED",
        metadata: {
          commentId: comment.id,
        },
      },
    });

    return comment;
  });
}

export async function getTaskComments(userId: string, taskId: string) {
  await ensureTaskMember(userId, taskId);

  return prisma.comment.findMany({
    where: {
      taskId,
    },
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
  });
}

export async function updateComment(
  userId: string,
  commentId: string,
  input: UpdateCommentInput,
) {
  const comment = await ensureCommentOwner(userId, commentId);

  return prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      body: input.body,
    },
  });
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await ensureCommentOwner(userId, commentId);

  await prisma.comment.delete({
    where: {
      id: comment.id,
    },
  });

  return {
    success: true,
  };
}
