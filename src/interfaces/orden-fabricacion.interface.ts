import type { EstadoCompra, ResultadoReembolso } from "./pago.interface";

export type EstadoOrdenFabricacion =
  | "solicitado"
  | "en_negociacion"
  | "trato_cerrado"
  | "confirmada"
  | "en_disputa"
  | "rechazado"
  | "cancelado"
  | "completado";

export interface OrdenFabricacion {
  id: string;
  compraId: string;
  fabricanteId: string;
  estado: EstadoOrdenFabricacion;
  /** Pesos (no centavos), igual que los precios propuestos. */
  precioAcordado: number | null;
  precioPropuestoComprador: number | null;
  precioPropuestoFabricante: number | null;
  cerradoPorComprador: boolean;
  cerradoPorFabricante: boolean;
  cerradoEn: string | null;
  creadoEn: string;
  /** Estado de la compra asociada, cuando la consulta lo incluye. */
  compraEstado: EstadoCompra | null;
  /** Solo con la orden en disputa o ya resuelta. */
  disputaMotivo?: string | null;
  disputaAbiertaEn?: string | null;
  disputaResolucion?: ResolucionDisputa | null;
}

export type ResolucionDisputa = "liberar_fabricante" | "reembolsar_comprador";

/** Máximo que acepta el backend para el motivo (y la nota de resolución) de una disputa. */
export const MAX_MOTIVO_DISPUTA = 1000;

export interface OrdenFabricacionCreada extends OrdenFabricacion {
  conversacionId: string;
}

export interface OrdenFabricacionListItem extends OrdenFabricacion {
  productoTitulo: string;
  conversacionId: string | null;
  /** Material de la compra; el backend aún no lo incluye en este listado. */
  material?: string | null;
}

export interface CodigoEntregaResponse {
  codigoEntrega: string;
}

export interface CerrarTratoResponse {
  message: string;
  data: OrdenFabricacion;
  /** true cuando este cierre finalizó el trato y el comprador debe pagar. */
  pagoRequerido: boolean;
  /** Checkout Pro; solo si cerró el comprador y se creó la preference. */
  initPoint: string | null;
}

export interface DisputaItem {
  ordenId: string;
  compraId: string;
  compradorId: string;
  fabricanteId: string;
  estadoOrden: EstadoOrdenFabricacion;
  estadoCompra: EstadoCompra;
  montoCentavos: number | null;
  motivo: string | null;
  abiertaPor: string | null;
  abiertaEn: string | null;
  resolucion: ResolucionDisputa | null;
  resueltaPor: string | null;
  resueltaEn: string | null;
  nota: string | null;
}

export type DisputaEstadoFiltro = "abiertas" | "resueltas";

export interface ResolverDisputaResponse {
  message: string;
  orden: OrdenFabricacion;
  resolucion: ResolucionDisputa;
  /** true si ya estaba resuelta igual y solo se reintentó lo pendiente. */
  idempotente: boolean;
  reembolso: ResultadoReembolso;
  /** Payouts ya transferidos que el reembolso no pudo revertir (recuperación manual). */
  payoutsYaPagados: number;
}

export interface CancelarOrdenResponse {
  message: string;
  data: OrdenFabricacion;
  reembolso: ResultadoReembolso;
}

export interface FabricantesSugeridosParams {
  disenoId: string;
  compraId: string;
  material?: string;
  page?: number;
  /** Máximo 50. */
  limit?: number;
}

export interface FabricanteSugerido {
  id: string;
  zonaId: number | null;
  puntuacion: number;
  tagline: string | null;
  username: string | null;
}
