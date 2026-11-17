import type {
  ApiResponse,
  CancelarOrdenResponse,
  CerrarTratoResponse,
  CodigoEntregaResponse,
  DisenoDeOrden,
  FabricanteSugerido,
  FabricantesSugeridosParams,
  OrdenFabricacion,
  OrdenFabricacionCreada,
  OrdenFabricacionListItem,
  PaginatedResponse,
  SolicitudCerrada,
  SolicitudesCerradasParams,
} from "../interfaces";
import { downloadFile, request } from "./http.client";
import { apiPath } from "../utils/api-path.util";

export const ordenFabricacionService = {
  fabricantesSugeridos: (
    {
      disenoId,
      compraId,
      material,
      page,
      limit,
      provincias,
      departamentos,
      localidades,
    }: FabricantesSugeridosParams,
    signal?: AbortSignal,
  ) => {
    const query = new URLSearchParams({ disenoId, compraId });
    if (material) query.set("material", material);
    if (page !== undefined) query.set("page", String(page));
    if (limit !== undefined) query.set("limit", String(limit));
    const zonas = { provincias, departamentos, localidades };
    Object.entries(zonas).forEach(([key, codigos]) => {
      const validos = (codigos ?? []).filter((c) => /^\d+$/.test(c));
      if (validos.length > 0) query.set(key, validos.join(","));
    });
    return request<FabricanteSugerido[]>(
      `/ordenes-fabricacion/fabricantes-sugeridos?${query.toString()}`,
      { signal },
    );
  },

  crear: (compraId: string, fabricanteIds: string[]) =>
    request<ApiResponse<OrdenFabricacionCreada[]>>("/ordenes-fabricacion", {
      method: "POST",
      body: JSON.stringify({ compraId, fabricanteIds }),
    }),

  proponerPrecio: (ordenId: string, precio: number) =>
    request<ApiResponse<OrdenFabricacion>>(
      apiPath`/ordenes-fabricacion/${ordenId}/proponer-precio`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  cerrarTrato: (ordenId: string, precio: number) =>
    request<CerrarTratoResponse>(
      apiPath`/ordenes-fabricacion/${ordenId}/cerrar-trato`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  cancelar: (ordenId: string) =>
    request<CancelarOrdenResponse>(apiPath`/ordenes-fabricacion/${ordenId}/cancelar`, {
      method: "POST",
    }),

  misSolicitudes: () =>
    request<ApiResponse<OrdenFabricacionListItem[]>>(
      "/ordenes-fabricacion/mis-solicitudes",
    ),

  // POST: cada llamada genera un código nuevo e invalida el anterior.
  codigoEntrega: (ordenId: string) =>
    request<ApiResponse<CodigoEntregaResponse>>(
      apiPath`/ordenes-fabricacion/${ordenId}/codigo-entrega`,
      { method: "POST" },
    ),

  disputar: (ordenId: string, motivo: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      apiPath`/ordenes-fabricacion/${ordenId}/disputar`,
      { method: "POST", body: JSON.stringify({ motivo }) },
    ),

  declararEntrega: (ordenId: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      apiPath`/ordenes-fabricacion/${ordenId}/declarar-entrega`,
      { method: "POST" },
    ),

  confirmarEntrega: (ordenId: string, codigo: string) =>
    request<ApiResponse<OrdenFabricacion>>(
      apiPath`/ordenes-fabricacion/${ordenId}/confirmar-entrega`,
      { method: "POST", body: JSON.stringify({ codigo }) },
    ),

  getDisenoDeOrden: (ordenId: string, signal?: AbortSignal) =>
    request<ApiResponse<DisenoDeOrden>>(
      apiPath`/ordenes-fabricacion/${ordenId}/diseno`,
      { signal },
    ),

  descargarDisenoDeOrden: (ordenId: string, fileName: string) =>
    descargarDisenoOrden(ordenId, fileName),

  getCerradasFabricante: (
    { page, limit }: SolicitudesCerradasParams = {},
    signal?: AbortSignal,
  ) => {
    const query = new URLSearchParams();
    if (page !== undefined) query.set("page", String(page));
    if (limit !== undefined) query.set("limit", String(limit));
    const qs = query.toString();
    const suffix = qs ? "?" + qs : "";
    return request<PaginatedResponse<SolicitudCerrada> & { message: string }>(
      `/ordenes-fabricacion/fabricante/cerradas${suffix}`,
      { signal },
    );
  },
};

export function descargarDisenoOrden(
  ordenId: string,
  fileName: string,
): Promise<void> {
  return downloadFile(
    apiPath`/ordenes-fabricacion/${ordenId}/descargar-diseno`,
    fileName,
  );
}
