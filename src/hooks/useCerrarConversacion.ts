import { useCallback, useState } from "react";
import { chatService } from "../services/chat.service";
import { getErrorToast, hasErrorCode } from "../services/http.client";
import { solicitudAbierta } from "../utils/estado.util";
import { CODIGO_CHAT_NO_CERRABLE } from "../interfaces";
import type { ConversacionResumen } from "../interfaces";
import type { AddToast } from "../types";

export interface TextosCerrarChat {
  /** Título del diálogo y etiqueta del botón de confirmación / del header. */
  titulo: string;
  mensaje: string;
  exito: string;
}

const AVISO_CERRAR =
  "Si cerrás el chat se pierde la conversación y vas a tener que iniciar uno nuevo. Esta acción no se puede deshacer.";

/** Textos del cierre: "Eliminar chat" si ya lo cerró la contraparte, "Cerrar chat" si no. */
export function textosCerrarChat(
  conversacion: Pick<
    ConversacionResumen,
    "miRol" | "estadoOrden" | "cerradaPorContraparte"
  >,
): TextosCerrarChat {
  if (conversacion.cerradaPorContraparte) {
    return {
      titulo: "Eliminar chat",
      mensaje:
        "El chat se eliminará de tus conversaciones. Esta acción no se puede deshacer.",
      exito: "Chat eliminado",
    };
  }
  let mensaje = AVISO_CERRAR;
  if (solicitudAbierta(conversacion.estadoOrden)) {
    const efecto =
      conversacion.miRol === "comprador" ? "se cancelará" : "se rechazará";
    mensaje = `${AVISO_CERRAR} Además, ${efecto} la solicitud de fabricación.`;
  }
  return { titulo: "Cerrar chat", mensaje, exito: "Chat cerrado" };
}

/**
 * Confirma y cierra (o elimina) una conversación con POST /conversaciones/:id/cerrar.
 * `onNoCerrable` se invoca con el 409 CHAT_NO_CERRABLE para refrescar el estado de la orden.
 */
export function useCerrarConversacion(
  addToast: AddToast,
  onCerrada: (conversacionId: string) => void,
  onNoCerrable: () => void,
) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  const abrir = useCallback(() => setAbierto(true), []);

  const cerrar = useCallback(() => {
    if (!loading) setAbierto(false);
  }, [loading]);

  const confirmar = useCallback(
    async (conversacionId: string, mensajeExito: string) => {
      setLoading(true);
      try {
        await chatService.cerrar(conversacionId);
        addToast(mensajeExito, "success");
        setAbierto(false);
        onCerrada(conversacionId);
      } catch (error) {
        if (hasErrorCode(error, CODIGO_CHAT_NO_CERRABLE)) {
          addToast(
            "Este chat ya no se puede cerrar: hay un trato en curso o una disputa abierta",
            "warning",
          );
          setAbierto(false);
          onNoCerrable();
        } else {
          const { message, type } = getErrorToast(
            error,
            "No se pudo cerrar el chat",
          );
          addToast(message, type);
        }
      } finally {
        setLoading(false);
      }
    },
    [addToast, onCerrada, onNoCerrable],
  );

  return { abierto, loading, abrir, cerrar, confirmar };
}
