import type {
  CrearCompraResponse,
  MisComprasItem,
  ConfirmarEntregaResponse,
} from "../interfaces";
import { BASE_URL, request } from "./http.client";

export const compraService = {
  crear: (disenoId: string) =>
    request<CrearCompraResponse>("/compras", {
      method: "POST",
      body: JSON.stringify({ disenoId }),
    }),

  misCompras: () => request<MisComprasItem[]>("/compras/mis-compras"),

  confirmarEntrega: (compraId: string, token: string) =>
    request<ConfirmarEntregaResponse>(
      `/compras/${compraId}/confirmar-entrega`,
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    ),
};

// El endpoint de descarga responde con un 302 y requiere el JWT como header
// (un <a href> plano no puede enviarlo), así que se hace fetch manual y se
// dispara la descarga del blob resultante, igual que uploadImage/uploadModel.
export async function descargarCompra(
  compraId: string,
  fileName: string,
): Promise<void> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${BASE_URL}/compras/${compraId}/descargar`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Error al descargar el archivo");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
