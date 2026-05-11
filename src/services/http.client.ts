import type { ApiError } from "../interfaces";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `HTTP error ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
