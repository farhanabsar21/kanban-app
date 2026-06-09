import { apiClient } from "../../../lib/api-client";

export type Notification = {
  id: string;
  recipientId: string;
  actorId: string | null;
  workspaceId: string | null;
  boardId: string | null;
  taskId: string | null;
  type: "TASK_ASSIGNED" | "COMMENT_ADDED" | "MENTIONED" | "TASK_UPDATED";
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
};

export async function getNotifications() {
  const res = await apiClient.get<{ notifications: Notification[] }>(
    "/notifications",
  );
  return res.data;
}

export async function getUnreadNotificationCount() {
  const res = await apiClient.get<{ count: number }>(
    "/notifications/unread-count",
  );
  return res.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const res = await apiClient.patch<{ notification: Notification }>(
    `/notifications/${notificationId}/read`,
  );
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await apiClient.patch<{ success: boolean }>(
    "/notifications/mark-all-read",
  );
  return res.data;
}
