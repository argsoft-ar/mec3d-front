import type {
  ApiResponse,
  CompraCancelada,
  CrearCompraPayload,
  CrearCompraResponse,
  EstadoCompraDiseno,
  MisComprasItem,
} from "../interfaces";
import { downloadFile, request } from "./http.client";
import { apiPath } from "../utils/api-path.util";

export const compraService = {
  crear: (payload: CrearCompraPayload) =>
    request<CrearCompraResponse>("/compras", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  misCompras: () => request<MisComprasItem[]>("/compras/mis-compras"),

  getEstadoCompraDiseno: (disenoId: string) =>
    request<EstadoCompraDiseno>(
      apiPath`/compras/diseno/${disenoId}/estado`,
      { keepSessionOnUnauthorized: true },
    ),

  cancelar: (compraId: string) =>
    request<ApiResponse<CompraCancelada>>(
      apiPath`/compras/${compraId}/cancelar`,
      { method: "POST" },
    ),
};

export function descargarCompra(
  compraId: string,
  fileName: string,
): Promise<void> {
  return downloadFile(apiPath`/compras/${compraId}/descargar`, fileName);
}
