import { request } from "./http.client";
import type { LoginResponse, RegisterResponse, RegisterRequest } from "../interfaces";

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

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },
};
