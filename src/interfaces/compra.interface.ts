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
}

export interface CrearCompraResponse {
  message: string;
  data: Compra;
  /** Token de escrow en texto plano; se muestra una única vez. */
  tokenVerificacion: string;
}

export interface ConfirmarEntregaResponse {
  message: string;
  data: Compra;
}
