import type {
  ApiResponse,
  ConversacionLeida,
  ConversacionResumen,
  NoLeidosTotal,
  PaginatedResponse,
  Mensaje,
} from "../interfaces";
import { request } from "./http.client";
import { apiPath } from "../utils/api-path.util";

export const chatService = {
  getMensajes: (conversacionId: string, page = 1, limit = 20) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return request<PaginatedResponse<Mensaje>>(
      `${apiPath`/conversaciones/${conversacionId}/mensajes`}?${query.toString()}`,
    );
  },

  misConversaciones: () =>
    request<ApiResponse<ConversacionResumen[]>>("/conversaciones/mias"),

  getNoLeidos: () =>
    request<ApiResponse<NoLeidosTotal>>("/conversaciones/no-leidos"),

  marcarLeida: (conversacionId: string) =>
    request<ApiResponse<ConversacionLeida>>(
      apiPath`/conversaciones/${conversacionId}/leer`,
      { method: "POST" },
    ),
};
