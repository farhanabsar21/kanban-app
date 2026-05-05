import { apiClient } from "../../../lib/api-client";

export async function addAssigneeToTask(taskId: string, userId: string) {
  const res = await apiClient.post(
    `/assignees/tasks/${taskId}/assignees/${userId}`,
  );

  return res.data;
}

export async function removeAssigneeFromTask(taskId: string, userId: string) {
  const res = await apiClient.delete(
    `/assignees/tasks/${taskId}/assignees/${userId}`,
  );

  return res.data;
}
