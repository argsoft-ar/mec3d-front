import type { EstadoOrdenFabricacion } from "./orden-fabricacion.interface";
import type { EstadoCompra, TipoCompra } from "./pago.interface";

export interface Compra {
  id: string;
  idComprador: string;
  idModelo: string;
  idDisenador: string;
  tipo: TipoCompra;
  estado: EstadoCompra;
  /** Centavos de ARS; null en fabricación hasta cerrarse el trato. */
  montoCentavos: number | null;
  moneda: string;
  /** Mismo monto expresado en pesos (solo para mostrar); null mientras no hay monto. */
  precioPagado: number | null;
  fecha: string;
  pagadaEn: string | null;
  entregaConfirmada: boolean;
  entregadoEn: string | null;
  fondosLiberados: boolean;
  fondosLiberadosEn: string | null;
  /** Material elegido por el comprador entre los del diseño, si lo hubo. */
  material: string | null;
}

export interface CompraDisenoInfo {
  titulo: string;
  imagenUrl: string | null;
  formato: string | null;
}

export interface MisComprasItem extends Compra {
  diseno: CompraDisenoInfo;
  /** Orden de fabricación ganadora (trato_cerrado/confirmada/completado), si existe. */
  ordenFabricacionId: string | null;
  ordenFabricacionEstado: EstadoOrdenFabricacion | null;
}

export interface CrearCompraPayload {
  disenoId: string;
  tipo: TipoCompra;
  material?: string;
}

export interface CrearCompraResponse {
  compra: Compra;
  /** Checkout Pro de Mercado Pago; null en fabricación (se paga al cerrar el trato). */
  initPoint: string | null;
}
