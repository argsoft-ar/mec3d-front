import type {
  ApiResponse,
  FabricanteSugerido,
  OrdenFabricacion,
} from "../interfaces";
import { request } from "./http.client";

export const ordenFabricacionService = {
  fabricantesSugeridos: (disenoId: string) =>
    request<FabricanteSugerido[]>(
      `/ordenes-fabricacion/fabricantes-sugeridos?disenoId=${encodeURIComponent(disenoId)}`,
    ),

  crear: (compraId: string, fabricanteIds: string[]) =>
    request<ApiResponse<OrdenFabricacion[]>>("/ordenes-fabricacion", {
      method: "POST",
      body: JSON.stringify({ compraId, fabricanteIds }),
    }),

  proponerPrecio: (ordenId: string, precio: number) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/proponer-precio`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  cerrarTrato: (ordenId: string, precio: number) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/cerrar-trato`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),
};
