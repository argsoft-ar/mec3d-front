import type {
  CrearCompraPayload,
  CrearCompraResponse,
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
};

export function descargarCompra(
  compraId: string,
  fileName: string,
): Promise<void> {
  return downloadFile(`/compras/${compraId}/descargar`, fileName);
}
