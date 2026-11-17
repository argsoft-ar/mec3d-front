import type { EstadoCompra, ResultadoReembolso } from "./pago.interface";
import type { ZonaFiltro } from "./georef.interface";

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

export interface DisenoOrdenEspecificaciones {
  dimensiones?: string;
  dificultad?: string;
  tiempoImpresion?: number;
  soportes?: string;
  configuracion?: { layer?: string; infill?: string };
}

/** Diseño de una orden visto por sus partes; nunca incluye el archivo original. */
export interface DisenoOrden {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagenUrl: string | null;
  previewUrl: string | null;
  categoria: string | null;
  tecnologia: string | null;
  materiales: string[];
  formato: string | null;
  pesoGramos: number | null;
  especificaciones: DisenoOrdenEspecificaciones | null;
}

export interface DisenoDeOrden {
  ordenId: string;
  estado: EstadoOrdenFabricacion;
  material: string | null;
  diseno: DisenoOrden;
  puedeDescargar: boolean;
}

export interface SolicitudCerrada {
  id: string;
  compraId: string;
  estado: Extract<
    EstadoOrdenFabricacion,
    "trato_cerrado" | "confirmada" | "completado"
  >;
  disenoId: string;
  disenoTitulo: string;
  disenoImagenUrl: string | null;
  compradorUsername: string | null;
  /** Pesos (no centavos). */
  precioAcordado: number | null;
  material: string | null;
  fechaCierre: string | null;
  actualizadoEn: string | null;
  conversacionId: string | null;
}

export interface SolicitudesCerradasParams {
  page?: number;
  limit?: number;
}

export interface CerrarTratoResponse {
  message: string;
  data: OrdenFabricacion;
  /** Solo el comprador cierra el trato: siempre requiere pago. */
  pagoRequerido: boolean;
  /** Checkout Pro; si es null se inicia el pago con POST /compras/:id/pagar. */
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

export interface FabricantesSugeridosParams extends Partial<ZonaFiltro> {
  disenoId: string;
  compraId: string;
  material?: string;
  page?: number;
  /** Máximo 50. */
  limit?: number;
}

/** Máximo de códigos por nivel que acepta el filtro de zonas. */
export const MAX_CODIGOS_ZONA_FILTRO = 50;

export interface FabricanteSugerido {
  id: string;
  zonaId: number | null;
  georefLocalidadId: string | null;
  puntuacion: number;
  tagline: string | null;
  username: string | null;
}
