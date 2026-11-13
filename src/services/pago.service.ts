import type { EstadoPagoResponse, IniciarPagoResponse } from "../interfaces";
import { request } from "./http.client";
import { apiPath } from "../utils/api-path.util";

export const pagoService = {
  /** Crea un nuevo checkout para una compra pendiente de pago (409 si no corresponde). */
  iniciarPago: (compraId: string) =>
    request<IniciarPagoResponse>(apiPath`/compras/${compraId}/pagar`, {
      method: "POST",
    }),

  /** Fuente de verdad al volver de Mercado Pago; la URL de retorno no lo es. */
  getEstadoPago: (compraId: string) =>
    request<EstadoPagoResponse>(apiPath`/compras/${compraId}/estado-pago`),
};
