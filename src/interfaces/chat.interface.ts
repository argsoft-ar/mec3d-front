export type TipoMensaje = "texto" | "sistema";

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

export interface JoinConversacionAck {
  ok: boolean;
  error?: string;
}

export interface EnviarMensajeAck {
  ok: boolean;
  error?: string;
  mensaje?: Mensaje;
}
