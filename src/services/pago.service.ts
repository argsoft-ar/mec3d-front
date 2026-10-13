import type { EstadoPagoResponse, IniciarPagoResponse } from "../interfaces";
import { request } from "./http.client";

export const pagoService = {
  /** Crea un nuevo checkout para una compra pendiente de pago (409 si no corresponde). */
  iniciarPago: (compraId: string) =>
    request<IniciarPagoResponse>(`/compras/${compraId}/pagar`, {
      method: "POST",
    }),

  /** Fuente de verdad al volver de Mercado Pago; la URL de retorno no lo es. */
  getEstadoPago: (compraId: string) =>
    request<EstadoPagoResponse>(`/compras/${compraId}/estado-pago`),
};
