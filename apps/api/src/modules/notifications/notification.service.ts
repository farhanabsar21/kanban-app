import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/app-error";
import { emitBoardEvent } from "../../realtime/socket";

export async function createNotification(input: {
  recipientId: string;
  actorId?: string;
  workspaceId?: string;
  boardId?: string;
  taskId?: string;
  type: "TASK_ASSIGNED" | "COMMENT_ADDED" | "MENTIONED" | "TASK_UPDATED";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  if (input.recipientId === input.actorId) return null;

  const notification = await prisma.notification.create({
    data: input,
  });

  if (input.boardId) {
    emitBoardEvent(input.boardId, "board:notification-created", {
      boardId: input.boardId,
      recipientId: input.recipientId,
      notificationId: notification.id,
    });
  }

  return notification;
}

export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
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
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      recipientId: userId,
      readAt: null,
    },
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      recipientId: userId,
    },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { success: true };
}
