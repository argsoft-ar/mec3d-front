export type TipoMensaje = "texto" | "sistema" | "propuesta_precio";

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string | null;
  contenido: string;
  tipo: TipoMensaje;
  creadoEn: string;
}

export interface DealClosedPayload {
  ordenFabricacionId: string;
  precioAcordado: number;
  mensaje: Mensaje;
}

export interface PrecioPropuestoPayload {
  ordenFabricacionId: string;
  role: "comprador" | "fabricante";
  precio: number;
  mensaje: Mensaje;
}

export interface OrdenCompletadaPayload {
  ordenFabricacionId: string;
  mensaje: Mensaje;
}

export interface EntregaDeclaradaPayload {
  ordenFabricacionId: string;
  mensaje: Mensaje;
}

export interface JoinConversacionAck {
  ok: boolean;
  error?: string;
}

export interface EnviarMensajeAck {
  ok: boolean;
  error?: string;
  mensaje?: Mensaje;
}

export interface ConversacionResumen {
  id: string;
  ordenFabricacionId: string;
  productoTitulo: string | null;
  miRol: "comprador" | "fabricante";
  contraparte: { id: string; username: string | null; tagline: string | null };
  estadoOrden: string; // EstadoOrdenFabricacion values: solicitado | en_negociacion | trato_cerrado | rechazado | cancelado | completado
  precioAcordado: number | null;
  precioPropuestoComprador: number | null;
  precioPropuestoFabricante: number | null;
  ultimoMensaje: { contenido: string; creadoEn: string } | null;
  creadoEn: string;
}
