import type { PaginatedResponse, Mensaje } from "../interfaces";
import { request } from "./http.client";

export const chatService = {
  getMensajes: (conversacionId: string, page = 1, limit = 20) =>
    request<PaginatedResponse<Mensaje>>(
      `/conversaciones/${conversacionId}/mensajes?page=${page}&limit=${limit}`,
    ),
};
