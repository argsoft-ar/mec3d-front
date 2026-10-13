import type {
  ApiResponse,
  CancelarOrdenResponse,
  CerrarTratoResponse,
  CodigoEntregaResponse,
  FabricanteSugerido,
  FabricantesSugeridosParams,
  OrdenFabricacion,
  OrdenFabricacionCreada,
  OrdenFabricacionListItem,
} from "../interfaces";
import { downloadFile, request } from "./http.client";

export const ordenFabricacionService = {
  fabricantesSugeridos: ({
    disenoId,
    compraId,
    material,
    page,
    limit,
  }: FabricantesSugeridosParams) => {
    const query = new URLSearchParams({ disenoId, compraId });
    if (material) query.set("material", material);
    if (page !== undefined) query.set("page", String(page));
    if (limit !== undefined) query.set("limit", String(limit));
    return request<FabricanteSugerido[]>(
      `/ordenes-fabricacion/fabricantes-sugeridos?${query.toString()}`,
    );
  },

  crear: (compraId: string, fabricanteIds: string[]) =>
    request<ApiResponse<OrdenFabricacionCreada[]>>("/ordenes-fabricacion", {
      method: "POST",
      body: JSON.stringify({ compraId, fabricanteIds }),
    }),

  proponerPrecio: (ordenId: string, precio: number) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/proponer-precio`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  cerrarTrato: (ordenId: string, precio: number) =>
    request<CerrarTratoResponse>(
      `/ordenes-fabricacion/${ordenId}/cerrar-trato`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  cancelar: (ordenId: string) =>
    request<CancelarOrdenResponse>(`/ordenes-fabricacion/${ordenId}/cancelar`, {
      method: "POST",
    }),

  misSolicitudes: () =>
    request<ApiResponse<OrdenFabricacionListItem[]>>(
      "/ordenes-fabricacion/mis-solicitudes",
    ),

  // POST: cada llamada genera un código nuevo e invalida el anterior.
  codigoEntrega: (ordenId: string) =>
    request<ApiResponse<CodigoEntregaResponse>>(
      `/ordenes-fabricacion/${ordenId}/codigo-entrega`,
      { method: "POST" },
    ),

  disputar: (ordenId: string, motivo: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/disputar`,
      { method: "POST", body: JSON.stringify({ motivo }) },
    ),

  declararEntrega: (ordenId: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/declarar-entrega`,
      { method: "POST" },
    ),

  confirmarEntrega: (ordenId: string, codigo: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/confirmar-entrega`,
      { method: "POST", body: JSON.stringify({ codigo }) },
    ),
};

export function descargarDisenoOrden(
  ordenId: string,
  fileName: string,
): Promise<void> {
  return downloadFile(
    `/ordenes-fabricacion/${ordenId}/descargar-diseno`,
    fileName,
  );
}
