export type EstadoOrdenFabricacion =
  | "solicitado"
  | "en_negociacion"
  | "trato_cerrado"
  | "rechazado"
  | "cancelado"
  | "completado";

export interface OrdenFabricacion {
  id: string;
  compraId: string;
  fabricanteId: string;
  estado: EstadoOrdenFabricacion;
  precioAcordado: number | null;
  precioPropuestoComprador: number | null;
  precioPropuestoFabricante: number | null;
  cerradoPorComprador: boolean;
  cerradoPorFabricante: boolean;
  cerradoEn: string | null;
  creadoEn: string;
}

export interface FabricanteSugerido {
  id: string;
  zonaId: number | null;
  puntuacion: number;
  tagline: string | null;
}
