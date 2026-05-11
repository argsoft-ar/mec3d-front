import type { ApiResponse } from "../interfaces";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  PartialUpdateProductPayload,
} from "../interfaces";
import { request } from "./http.client";

export const productService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<Product[]>(`/productos${query}`);
  },

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
