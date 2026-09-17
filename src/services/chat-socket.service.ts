import { getSocket } from "./socket.client";
import type {
  Mensaje,
  DealClosedPayload,
  JoinConversacionAck,
  EnviarMensajeAck,
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
    const socket = getSocket();
    socket.on("nuevo-mensaje", cb);
    return () => socket.off("nuevo-mensaje", cb);
  },

  onDealClosed: (cb: (payload: DealClosedPayload) => void): (() => void) => {
    const socket = getSocket();
    socket.on("deal-closed", cb);
    return () => socket.off("deal-closed", cb);
  },
};
