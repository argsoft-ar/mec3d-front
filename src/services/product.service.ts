import type {
  ApiResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  PartialUpdateProductPayload,
} from "../interfaces";
import { BASE_URL, request } from "./http.client";

export const productService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<Product[]>(`/productos${query}`);
  },

  getMine: () => request<Product[]>("/productos/mis-disenos"),

  create: (payload: CreateProductPayload) =>
    request<ApiResponse<Product>>("/productos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateProductPayload) =>
    request<ApiResponse<Product>>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  partialUpdate: (id: string, payload: PartialUpdateProductPayload) =>
    request<ApiResponse<Product>>(`/productos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    request<ApiResponse<Product>>(`/productos/${id}`, {
      method: "DELETE",
    }),
};

export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem("auth_token");
  const formData = new FormData();
  formData.append("imagen", file);

  const response = await fetch(`${BASE_URL}/archivos/imagen`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir la imagen");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
