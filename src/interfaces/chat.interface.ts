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

export type RolConversacion = "comprador" | "fabricante";

/** Evento `orden-cancelada` (sala de la conversación) al cerrar un chat con la solicitud abierta. */
export interface OrdenCanceladaPayload {
  ordenFabricacionId: string;
  estado: EstadoOrdenFabricacion;
  cerradaPor: RolConversacion;
  /** Mensaje de sistema que informa la cancelación/rechazo. */
  mensaje: Mensaje;
}

/** Evento `conversacion-cerrada` emitido a la sala `user:<id>` de la contraparte. */
export interface ConversacionCerradaPayload {
  conversacionId: string;
  ordenFabricacionId: string;
  ordenEstado: EstadoOrdenFabricacion;
  cerradaPor: RolConversacion;
}

/** `data` de POST /conversaciones/:id/cerrar. */
export interface ConversacionCerrada {
  conversacionId: string;
  ordenEstado: EstadoOrdenFabricacion;
}

/** 409 de POST /conversaciones/:id/cerrar: trato cerrado, entrega pendiente o disputa. */
export const CODIGO_CHAT_NO_CERRABLE = "CHAT_NO_CERRABLE";

/** Rechazo de `enviar-mensaje` cuando la conversación ya fue cerrada. */
export const CODIGO_CONVERSACION_CERRADA = "CONVERSACION_CERRADA";

export interface JoinConversacionAck {
  ok: boolean;
  error?: string;
}

export interface EnviarMensajeAck {
  ok: boolean;
  error?: string;
  /** Código de negocio del rechazo (p. ej. CONVERSACION_CERRADA). */
  code?: string;
  mensaje?: Mensaje;
}

export interface ConversacionResumen {
  id: string;
  ordenFabricacionId: string;
  productoTitulo: string | null;
  miRol: RolConversacion;
  contraparte: { id: string; username: string | null; tagline: string | null };
  estadoOrden: EstadoOrdenFabricacion;
  precioAcordado: number | null;
  precioPropuestoComprador: number | null;
  precioPropuestoFabricante: number | null;
  ultimoMensaje: { contenido: string; creadoEn: string } | null;
  noLeidos: number;
  /** La otra parte cerró el chat: solo queda eliminarlo de la lista. */
  cerradaPorContraparte: boolean;
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
