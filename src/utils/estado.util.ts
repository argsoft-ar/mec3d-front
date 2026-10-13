import type {
  EstadoCompra,
  EstadoMovimiento,
  EstadoOrdenFabricacion,
  EstadoPago,
  ResolucionDisputa,
  ResultadoReembolso,
  TipoMovimiento,
} from "../interfaces";
import type { TagVariant } from "../types";

export interface EstadoVisual {
  label: string;
  variant: TagVariant;
}

const ESTADO_COMPRA: Record<EstadoCompra, EstadoVisual> = {
  pendiente_pago: { label: "Pago pendiente", variant: "warning" },
  pagada: { label: "Pagada", variant: "success" },
  completada: { label: "Completada", variant: "success" },
  reembolsada: { label: "Reembolsada", variant: "info" },
  cancelada: { label: "Cancelada", variant: "danger" },
};

const ESTADO_PAGO: Record<EstadoPago, EstadoVisual> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  aprobado: { label: "Aprobado", variant: "success" },
  rechazado: { label: "Rechazado", variant: "danger" },
  reembolsado: { label: "Reembolsado", variant: "info" },
};

const ESTADO_ORDEN: Record<EstadoOrdenFabricacion, EstadoVisual> = {
  solicitado: { label: "Solicitado", variant: "info" },
  en_negociacion: { label: "En negociación", variant: "warning" },
  trato_cerrado: { label: "Trato cerrado", variant: "success" },
  confirmada: { label: "Entrega confirmada por el comprador", variant: "info" },
  en_disputa: { label: "En disputa", variant: "danger" },
  rechazado: { label: "Rechazado", variant: "danger" },
  cancelado: { label: "Cancelado", variant: "danger" },
  completado: { label: "Completado", variant: "success" },
};

export const AVISO_EN_DISPUTA =
  "Un administrador revisará el caso. Los fondos quedan congelados hasta que se resuelva.";

const ESTADO_MOVIMIENTO: Record<EstadoMovimiento, EstadoVisual> = {
  retenido: { label: "Retenido", variant: "warning" },
  liberado: { label: "Liberado", variant: "info" },
  pendiente_payout: { label: "Pendiente de cobro", variant: "info" },
  pagado: { label: "Pagado", variant: "success" },
  reembolsado: { label: "Reembolsado", variant: "neutral" },
};

const TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  retencion: "Retención",
  comision_plataforma: "Comisión de plataforma",
  regalia_disenador: "Regalía de diseñador",
  pago_fabricante: "Pago de fabricación",
  pago_disenador: "Pago de diseño",
  reembolso: "Reembolso",
};

export const estadoCompraVisual = (estado: EstadoCompra): EstadoVisual =>
  ESTADO_COMPRA[estado];

export const estadoPagoVisual = (estado: EstadoPago): EstadoVisual =>
  ESTADO_PAGO[estado];

export const estadoMovimientoVisual = (
  estado: EstadoMovimiento,
): EstadoVisual => ESTADO_MOVIMIENTO[estado];

export const tipoMovimientoLabel = (tipo: TipoMovimiento): string =>
  TIPO_MOVIMIENTO[tipo];

export const estadoOrdenVisual = (
  estado: EstadoOrdenFabricacion,
): EstadoVisual => ESTADO_ORDEN[estado];

const RESOLUCION_DISPUTA: Record<ResolucionDisputa, string> = {
  liberar_fabricante: "Liberar fondos al fabricante",
  reembolsar_comprador: "Reembolsar al comprador",
};

export const resolucionDisputaLabel = (resolucion: ResolucionDisputa): string =>
  RESOLUCION_DISPUTA[resolucion];

/** El comprador solo puede disputar con el trato cerrado o la entrega declarada y el pago acreditado. */
export function puedeDisputarOrden(
  estadoOrden: EstadoOrdenFabricacion | null | undefined,
  estadoCompra: EstadoCompra | null | undefined,
): boolean {
  return (
    (estadoOrden === "trato_cerrado" || estadoOrden === "confirmada") &&
    compraPagada(estadoCompra)
  );
}

/** La descarga del archivo solo se habilita con el pago acreditado. */
export function compraPagada(estado: EstadoCompra | null | undefined): boolean {
  return estado === "pagada" || estado === "completada";
}

/** true si la fecha de liberación todavía no llegó (el payout sigue en retención). */
export function enRetencionHasta(
  liberableDesde: string | null | undefined,
): boolean {
  if (!liberableDesde) return false;
  const time = new Date(liberableDesde).getTime();
  return !Number.isNaN(time) && time > Date.now();
}

export function mensajeReembolso(reembolso: ResultadoReembolso): {
  message: string;
  type: "success" | "info" | "warning";
} {
  switch (reembolso) {
    case "reembolsado":
      return {
        message: "Orden cancelada. El pago fue reembolsado.",
        type: "success",
      };
    case "pendiente":
      return {
        message:
          "Orden cancelada. El reembolso quedó pendiente y se procesará a la brevedad.",
        type: "warning",
      };
    case "no_aplica":
      return {
        message: "Orden cancelada. No había un pago que reembolsar.",
        type: "info",
      };
  }
}
