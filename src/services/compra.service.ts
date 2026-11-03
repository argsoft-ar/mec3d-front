import type {
  ApiResponse,
  CompraCancelada,
  CrearCompraPayload,
  CrearCompraResponse,
  EstadoCompraDiseno,
  MisComprasItem,
} from "../interfaces";
import { downloadFile, request } from "./http.client";

export const compraService = {
  crear: (payload: CrearCompraPayload) =>
    request<CrearCompraResponse>("/compras", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  misCompras: () => request<MisComprasItem[]>("/compras/mis-compras"),

  getEstadoCompraDiseno: (disenoId: string) =>
    request<EstadoCompraDiseno>(
      `/compras/diseno/${encodeURIComponent(disenoId)}/estado`,
      { keepSessionOnUnauthorized: true },
    ),

  cancelar: (compraId: string) =>
    request<ApiResponse<CompraCancelada>>(
      `/compras/${encodeURIComponent(compraId)}/cancelar`,
      { method: "POST" },
    ),
};

export function descargarCompra(
  compraId: string,
  fileName: string,
): Promise<void> {
  return downloadFile(`/compras/${compraId}/descargar`, fileName);
}
