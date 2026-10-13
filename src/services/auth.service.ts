import { request } from "./http.client";
import { clearSessionData } from "./session";
import { disconnectSocket } from "./socket.client";
import type {
  LoginResponse,
  RegisterResponse,
  RegisterRequest,
} from "../interfaces";

export const authService = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>("/auth/registro", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkUsernameDisponible: (username: string) =>
    request<{ disponible: boolean }>(
      `/auth/username-disponible?username=${encodeURIComponent(username)}`,
    ),

  logout: () => {
    clearSessionData();
    disconnectSocket();
  },
};
