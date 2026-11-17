import type {
  ApiResponse,
  ArchivoPreviewResponse,
  PreviewPublicoResponse,
  PaginatedResponse,
  Product,
  CreateProductPayload,
  PartialUpdateProductPayload,
} from "../interfaces";
import { request } from "./http.client";
import { apiPath } from "../utils/api-path.util";

export const productService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoria?: string;
  }) => {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [k, v]) =>
              v !== undefined ? { ...acc, [k]: String(v) } : acc,
            {},
          ),
        ).toString()}`
      : "";
    return request<PaginatedResponse<Product>>(`/productos${query}`);
  },

  /** Lanza HttpError 404 si no existe o fue eliminado, y 400 si el id no es UUID. */
  getById: (id: string) =>
    request<Product>(apiPath`/productos/${id}`),

  getMine: () => request<Product[]>("/productos/mis-disenos"),

  /** URL firmada (vida corta) para el visor 3D; requiere acceso al archivo. */
  getArchivoPreview: (id: string) =>
    request<ArchivoPreviewResponse>(apiPath`/productos/${id}/archivo-preview`, {
      keepSessionOnUnauthorized: true,
    }),

  /** URL firmada (300 s) del STL simplificado; pública, sin auth, con rate-limit. */
  getPreviewPublico: (id: string) =>
    request<PreviewPublicoResponse>(apiPath`/productos/${id}/preview-publico`),

  create: (payload: CreateProductPayload) =>
    request<ApiResponse<Product>>("/productos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: CreateProductPayload) =>
    request<ApiResponse<Product>>(apiPath`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  partialUpdate: (id: string, payload: PartialUpdateProductPayload) =>
    request<ApiResponse<Product>>(apiPath`/productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    request<ApiResponse<Product>>(apiPath`/productos/${id}`, {
      method: "DELETE",
    }),
};

/** Sube un archivo multipart por el http client (cookie de sesión, validación de ruta, 401). */
async function uploadArchivo(
  endpoint: string,
  field: string,
  file: File,
  errorMessage: string,
): Promise<string> {
  const formData = new FormData();
  formData.append(field, file);
  try {
    const { url } = await request<{ url: string }>(endpoint, {
      method: "POST",
      body: formData,
    });
    return url;
  } catch (error: unknown) {
    // Se conserva el mensaje genérico previo para la UI; el detalle queda en `cause`.
    throw new Error(errorMessage, { cause: error });
  }
}

export function uploadImage(file: File): Promise<string> {
  return uploadArchivo(
    "/archivos/imagen",
    "imagen",
    file,
    "Error al subir la imagen",
  );
}

export function uploadModel(file: File): Promise<string> {
  return uploadArchivo(
    "/archivos/modelo",
    "archivo",
    file,
    "Error al subir el archivo 3D",
  );
}