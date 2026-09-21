import type {
  ApiResponse,
  FabricanteSugerido,
  OrdenFabricacion,
  OrdenFabricacionCreada,
  OrdenFabricacionListItem,
  CodigoEntregaResponse,
} from "../interfaces";
import { BASE_URL, request } from "./http.client";

export const ordenFabricacionService = {
  fabricantesSugeridos: (disenoId: string) =>
    request<FabricanteSugerido[]>(
      `/ordenes-fabricacion/fabricantes-sugeridos?disenoId=${encodeURIComponent(disenoId)}`,
    ),

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
    request<ApiResponse<OrdenFabricacion>>(
      `/ordenes-fabricacion/${ordenId}/cerrar-trato`,
      { method: "POST", body: JSON.stringify({ precio }) },
    ),

  misSolicitudes: () =>
    request<ApiResponse<OrdenFabricacionListItem[]>>(
      "/ordenes-fabricacion/mis-solicitudes",
    ),

  codigoEntrega: (ordenId: string) =>
    request<ApiResponse<CodigoEntregaResponse>>(
      `/ordenes-fabricacion/${ordenId}/codigo-entrega`,
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

// Igual que descargarCompra: el endpoint responde 302 y exige el JWT como header,
// por lo que un <a href> plano no serviría; se hace fetch manual y se dispara la
// descarga del blob resultante.
export async function descargarDisenoOrden(
  ordenId: string,
  fileName: string,
): Promise<void> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${BASE_URL}/ordenes-fabricacion/${ordenId}/descargar-diseno`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

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
