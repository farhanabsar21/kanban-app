import { apiClient } from "../../../lib/api-client";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: User;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function register(input: RegisterInput) {
  const res = await apiClient.post<AuthResponse>("/auth/register", input);
  return res.data;
}

export async function login(input: LoginInput) {
  const res = await apiClient.post<AuthResponse>("/auth/login", input);
  return res.data;
}

export async function logout() {
  const res = await apiClient.post<{ message: string }>("/auth/logout");
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get<AuthResponse>("/auth/me");
  return res.data;
}
