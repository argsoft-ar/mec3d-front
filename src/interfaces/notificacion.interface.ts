import type { ConversacionResumen } from "./chat.interface";

export type NoLeidosPorConversacion = Readonly<Record<string, number>>;

/** Último evento de socket que puede requerir recargar la lista de conversaciones. */
export interface EventoConversacion {
  conversacionId: string;
  tipo: "mensaje" | "solicitud";
  /** Crece con cada evento para distinguir eventos repetidos de la misma conversación. */
  seq: number;
}

export interface NotificacionesContextValue {
  /** Total de mensajes no leídos del usuario (fuente: GET /conversaciones/no-leidos + eventos). */
  totalNoLeidos: number;
  /** No leídos conocidos por conversación (eventos recibidos o sincronizados desde la lista). */
  noLeidosPorConversacion: NoLeidosPorConversacion;
  conversacionActiva: string | null;
  /** Mensajes de la conversación activa no suman ni muestran toast: se marcan leídos. */
  setConversacionActiva: (conversacionId: string | null) => void;
  marcarConversacionLeida: (conversacionId: string) => Promise<void>;
  /** Siembra los contadores por conversación con el `noLeidos` de GET /conversaciones/mias. */
  sincronizarNoLeidos: (
    conversaciones: ReadonlyArray<Pick<ConversacionResumen, "id" | "noLeidos">>,
  ) => void;
  refrescarTotal: () => Promise<void>;
  /** Mensaje de otra conversación o nueva solicitud de fabricación; null hasta el primer evento. */
  ultimoEventoConversacion: EventoConversacion | null;
}
