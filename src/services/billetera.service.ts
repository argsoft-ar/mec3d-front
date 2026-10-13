import type { BilleteraParams, BilleteraResponse } from "../interfaces";
import { request } from "./http.client";

export const billeteraService = {
  getMiBilletera: ({ page, limit, estado }: BilleteraParams = {}) => {
    const query = new URLSearchParams();
    if (page !== undefined) query.set("page", String(page));
    if (limit !== undefined) query.set("limit", String(limit));
    if (estado) query.set("estado", estado);
    const qs = query.toString();
    return request<BilleteraResponse>(
      `/usuarios/mi-billetera${qs ? `?${qs}` : ""}`,
    );
  },
};
