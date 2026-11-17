import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chat.service";
import { useNotificaciones } from "./useNotificaciones";
import type { ConversacionResumen } from "../interfaces";
import type { ToastType } from "../types";

interface UseConversacionesReturn {
  conversaciones: ConversacionResumen[];
  loading: boolean;
  refresh: () => void;
  /** No leídos por conversación: `noLeidos` de /mias combinado con los eventos en vivo. */
  noLeidosDe: (conversacionId: string) => number;
}

export function useConversaciones(
  addToast: (message: string, type: ToastType) => void,
): UseConversacionesReturn {
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const {
    sincronizarNoLeidos,
    noLeidosPorConversacion,
    conversacionActiva,
    ultimoEventoConversacion,
  } = useNotificaciones();

  const refresh = useCallback(() => {
    chatService
      .misConversaciones()
      .then((res) => {
        const lista = res.data ?? [];
        setConversaciones(lista);
        sincronizarNoLeidos(lista);
      })
      .catch(() =>
        addToast("No se pudieron cargar las conversaciones", "error"),
      )
      .finally(() => setLoading(false));
  }, [addToast, sincronizarNoLeidos]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Una solicitud nueva o un mensaje de una conversación fuera de la lista obliga a recargarla.
  const seqProcesado = useRef(ultimoEventoConversacion?.seq ?? 0);
  useEffect(() => {
    if (!ultimoEventoConversacion) return;
    if (ultimoEventoConversacion.seq <= seqProcesado.current) return;
    seqProcesado.current = ultimoEventoConversacion.seq;
    const conocida = conversaciones.some(
      (c) => c.id === ultimoEventoConversacion.conversacionId,
    );
    if (ultimoEventoConversacion.tipo === "solicitud" || !conocida) refresh();
  }, [ultimoEventoConversacion, conversaciones, refresh]);

  const noLeidosDe = useCallback(
    (conversacionId: string) =>
      conversacionId === conversacionActiva
        ? 0
        : (noLeidosPorConversacion[conversacionId] ?? 0),
    [conversacionActiva, noLeidosPorConversacion],
  );

  return { conversaciones, loading, refresh, noLeidosDe };
}
