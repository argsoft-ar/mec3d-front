import { getSocket, onSocketEvent } from "./socket.client";
import type {
  Mensaje,
  DealClosedPayload,
  PrecioPropuestoPayload,
  OrdenCompletadaPayload,
  EntregaDeclaradaPayload,
  OrdenCanceladaPayload,
  ConversacionCerradaPayload,
  JoinConversacionAck,
  EnviarMensajeAck,
  MarcarLeidoAck,
  NotificacionMensajePayload,
  NuevaSolicitudFabricacionPayload,
} from "../interfaces";

// Nota de contrato: el socket del backend espera "join-conversacion" con el
// conversacionId como string plano (no un objeto envolvente), a diferencia de
// "enviar-mensaje" que sí espera { conversacionId, contenido }. Se replica
// exactamente el shape verificado en src/sockets/chat.socket.ts del backend.
export const chatSocketService = {
  joinConversacion: (conversacionId: string): Promise<JoinConversacionAck> =>
    new Promise((resolve) => {
      getSocket().emit(
        "join-conversacion",
        conversacionId,
        (res: JoinConversacionAck) => resolve(res),
      );
    }),

  enviarMensaje: (
    conversacionId: string,
    contenido: string,
  ): Promise<EnviarMensajeAck> =>
    new Promise((resolve) => {
      getSocket().emit(
        "enviar-mensaje",
        { conversacionId, contenido },
        (res: EnviarMensajeAck) => resolve(res),
      );
    }),

  onNuevoMensaje: (cb: (mensaje: Mensaje) => void): (() => void) => {
    return onSocketEvent("nuevo-mensaje", cb);
  },

  onDealClosed: (cb: (payload: DealClosedPayload) => void): (() => void) => {
    return onSocketEvent("deal-closed", cb);
  },

  onPrecioPropuesto: (
    cb: (payload: PrecioPropuestoPayload) => void,
  ): (() => void) => {
    return onSocketEvent("precio-propuesto", cb);
  },

  onOrdenCompletada: (
    cb: (payload: OrdenCompletadaPayload) => void,
  ): (() => void) => {
    return onSocketEvent("orden-completada", cb);
  },

  onEntregaDeclarada: (
    cb: (payload: EntregaDeclaradaPayload) => void,
  ): (() => void) => {
    return onSocketEvent("entrega-declarada", cb);
  },

  onOrdenCancelada: (
    cb: (payload: OrdenCanceladaPayload) => void,
  ): (() => void) => {
    return onSocketEvent("orden-cancelada", cb);
  },

  onConversacionCerrada: (
    cb: (payload: ConversacionCerradaPayload) => void,
  ): (() => void) => {
    return onSocketEvent("conversacion-cerrada", cb);
  },

  marcarLeido: (conversacionId: string): Promise<MarcarLeidoAck> =>
    new Promise((resolve) => {
      getSocket().emit(
        "marcar-leido",
        { conversacionId },
        (res: MarcarLeidoAck) => resolve(res),
      );
    }),

  onNotificacionMensaje: (
    cb: (payload: NotificacionMensajePayload) => void,
  ): (() => void) => {
    return onSocketEvent("notificacion-mensaje", cb);
  },

  onNuevaSolicitudFabricacion: (
    cb: (payload: NuevaSolicitudFabricacionPayload) => void,
  ): (() => void) => {
    return onSocketEvent("nueva-solicitud-fabricacion", cb);
  },
};
