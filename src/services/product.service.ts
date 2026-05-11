import { request } from "./http.client";

export const productService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<unknown[]>(`/products${query}`);
  },

  getById: (id: string) => request<unknown>(`/products/${id}`),
};
