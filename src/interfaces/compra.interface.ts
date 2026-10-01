import type { EstadoOrdenFabricacion } from "./orden-fabricacion.interface";

export interface Compra {
  id: string;
  idComprador: string;
  idModelo: string;
  idDisenador: string;
  precioPagado: number;
  fecha: string;
  entregaConfirmada: boolean;
  entregadoEn: string | null;
  fondosLiberados: boolean;
  fondosLiberadosEn: string | null;
}

export interface CompraDisenoInfo {
  titulo: string;
  imagenUrl: string | null;
  formato: string | null;
  archivoUrl: string;
}

export interface MisComprasItem extends Compra {
  diseno: CompraDisenoInfo;
  /** Orden de fabricación ganadora (trato_cerrado/confirmada/completado), si existe. */
  ordenFabricacionId: string | null;
  ordenFabricacionEstado: EstadoOrdenFabricacion | null;
}

export interface CrearCompraResponse {
  message: string;
  data: Compra;
}
