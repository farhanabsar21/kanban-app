import { apiClient } from "../../../lib/api-client";

export type Label = {
  id: string;
  workspaceId: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type CreateLabelInput = {
  workspaceId: string;
  name: string;
  color?: string;
};

export async function getWorkspaceLabels(workspaceId: string) {
  const res = await apiClient.get<{ labels: Label[] }>(
    `/labels/workspaces/${workspaceId}/labels`,
  );

  return res.data;
}

export async function attachLabelToTask(taskId: string, labelId: string) {
  const res = await apiClient.post(`/labels/tasks/${taskId}/labels/${labelId}`);

  return res.data;
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
  const res = await apiClient.delete(
    `/labels/tasks/${taskId}/labels/${labelId}`,
  );

  return res.data;
}

export async function createLabel(input: CreateLabelInput) {
  const res = await apiClient.post<{ label: Label }>("/labels", input);
  return res.data;
}
