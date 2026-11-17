import type {
  ApiResponse,
  ConversacionCerrada,
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
    const path = apiPath`/conversaciones/${conversacionId}/mensajes`;
    return request<PaginatedResponse<Mensaje>>(`${path}?${query.toString()}`);
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

  /** Cierra el chat (o lo elimina si ya lo cerró la contraparte); cancela/rechaza la solicitud abierta. */
  cerrar: (conversacionId: string) =>
    request<ApiResponse<ConversacionCerrada>>(
      apiPath`/conversaciones/${conversacionId}/cerrar`,
      { method: "POST" },
    ),
};
