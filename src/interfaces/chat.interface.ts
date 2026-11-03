import type { EstadoOrdenFabricacion } from "./orden-fabricacion.interface";

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
  estadoOrden: EstadoOrdenFabricacion;
  precioAcordado: number | null;
  precioPropuestoComprador: number | null;
  precioPropuestoFabricante: number | null;
  ultimoMensaje: { contenido: string; creadoEn: string } | null;
  noLeidos: number;
  creadoEn: string;
}

/** Evento `notificacion-mensaje` emitido a la sala `user:<id>`. */
export interface NotificacionMensajePayload {
  conversacionId: string;
  mensajeId: string;
  remitenteUsername: string | null;
  /** Texto plano, hasta 100 caracteres. */
  preview: string;
  tipo: TipoMensaje;
  creadoEn: string;
}

/** Evento `nueva-solicitud-fabricacion` emitido al fabricante. */
export interface NuevaSolicitudFabricacionPayload {
  ordenId: string;
  conversacionId: string;
  disenoId: string;
  disenoTitulo: string;
  compradorUsername: string | null;
}

export type MarcarLeidoAck =
  | { ok: true; conversacionId: string; noLeidos: 0 }
  | { ok: false; error: string };

export interface NoLeidosTotal {
  total: number;
}

export interface ConversacionLeida {
  conversacionId: string;
  noLeidos: 0;
}
