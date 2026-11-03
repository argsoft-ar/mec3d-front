import type {
  ApiResponse,
  ConversacionLeida,
  ConversacionResumen,
  NoLeidosTotal,
  PaginatedResponse,
  Mensaje,
} from "../interfaces";
import { request } from "./http.client";

export const chatService = {
  getMensajes: (conversacionId: string, page = 1, limit = 20) =>
    request<PaginatedResponse<Mensaje>>(
      `/conversaciones/${conversacionId}/mensajes?page=${page}&limit=${limit}`,
    ),

  misConversaciones: () =>
    request<ApiResponse<ConversacionResumen[]>>("/conversaciones/mias"),

  getNoLeidos: () =>
    request<ApiResponse<NoLeidosTotal>>("/conversaciones/no-leidos"),

  marcarLeida: (conversacionId: string) =>
    request<ApiResponse<ConversacionLeida>>(
      `/conversaciones/${encodeURIComponent(conversacionId)}/leer`,
      { method: "POST" },
    ),
};
