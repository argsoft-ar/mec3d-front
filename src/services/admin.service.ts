import type {
  AdminListParams,
  ApiResponse,
  DisputaEstadoFiltro,
  DisputaItem,
  MovimientoBilletera,
  PaginatedResponse,
  PayoutPendiente,
  ResolverDisputaPayload,
  ResolverDisputaResponse,
  ResumenReintentoReembolsos,
} from "../interfaces";
import { request } from "./http.client";

function paginationQuery(
  { page, limit }: AdminListParams,
  extra: Record<string, string> = {},
): string {
  const query = new URLSearchParams(extra);
  if (page !== undefined) query.set("page", String(page));
  if (limit !== undefined) query.set("limit", String(limit));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const adminService = {
  listarPayoutsPendientes: (params: AdminListParams = {}) =>
    request<PaginatedResponse<PayoutPendiente>>(
      `/admin/payouts/pendientes${paginationQuery(params)}`,
    ),

  marcarPayoutPagado: (payoutId: string, referencia: string) =>
    request<ApiResponse<MovimientoBilletera>>(
      `/admin/payouts/${payoutId}/marcar-pagado`,
      { method: "POST", body: JSON.stringify({ referencia }) },
    ),

  listarDisputas: (
    params: AdminListParams = {},
    estado: DisputaEstadoFiltro = "abiertas",
  ) =>
    request<PaginatedResponse<DisputaItem>>(
      `/admin/disputas${paginationQuery(params, { estado })}`,
    ),

  resolverDisputa: (ordenId: string, payload: ResolverDisputaPayload) =>
    request<ResolverDisputaResponse>(`/admin/disputas/${ordenId}/resolver`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  reintentarReembolsosPendientes: () =>
    request<ResumenReintentoReembolsos>(
      "/admin/pagos/reembolsos-pendientes/reintentar",
      { method: "POST" },
    ),
};
