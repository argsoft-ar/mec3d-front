import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { NotificacionesContext } from "./NotificacionesContext";
import ToastContainer from "../components/Toast/ToastContainer";
import { useToast } from "../hooks/useToast";
import { chatService } from "../services/chat.service";
import { chatSocketService } from "../services/chat-socket.service";
import type {
  ConversacionResumen,
  EventoConversacion,
  NotificacionesContextValue,
} from "../interfaces";

const TOAST_DURATION = 6000;

interface NotificacionesProviderProps {
  children: React.ReactNode;
}

function sinConversacion(
  prev: Record<string, number>,
  conversacionId: string,
): Record<string, number> {
  if (!(conversacionId in prev)) return prev;
  const next = { ...prev };
  delete next[conversacionId];
  return next;
}

/** Debe montarse solo con sesión activa: abre el socket y consulta endpoints autenticados. */
function NotificacionesProvider({ children }: NotificacionesProviderProps) {
  const navigate = useNavigate();
  const rutaChat = useMatch("/chat/:conversacionId");
  const { toasts, addToast, removeToast } = useToast();
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const [noLeidosPorConversacion, setNoLeidosPorConversacion] = useState<
    Record<string, number>
  >({});
  const [conversacionExplicita, setConversacionActiva] = useState<
    string | null
  >(null);
  const [ultimoEventoConversacion, setUltimoEventoConversacion] =
    useState<EventoConversacion | null>(null);
  // Si ChatPage no la declara, se infiere de la ruta /chat/:conversacionId.
  const conversacionActiva =
    conversacionExplicita ?? rutaChat?.params.conversacionId ?? null;

  const activaRef = useRef(conversacionActiva);
  const navigateRef = useRef(navigate);
  useEffect(() => {
    activaRef.current = conversacionActiva;
    navigateRef.current = navigate;
  }, [conversacionActiva, navigate]);

  const refrescarTotal = useCallback(
    () =>
      chatService
        .getNoLeidos()
        .then((res) => setTotalNoLeidos(res.data?.total ?? 0))
        // Se conserva el último total conocido.
        .catch(() => undefined),
    [],
  );

  const marcarConversacionLeida = useCallback(
    (conversacionId: string) =>
      chatService
        .marcarLeida(conversacionId)
        // Igual se limpia el contador local; el total se resincroniza después.
        .catch(() => undefined)
        .then(() => {
          setNoLeidosPorConversacion((prev) =>
            sinConversacion(prev, conversacionId),
          );
          return refrescarTotal();
        }),
    [refrescarTotal],
  );

  const sincronizarNoLeidos = useCallback(
    (
      conversaciones: ReadonlyArray<
        Pick<ConversacionResumen, "id" | "noLeidos">
      >,
    ) => {
      setNoLeidosPorConversacion(
        Object.fromEntries(
          conversaciones
            .filter((c) => c.noLeidos > 0 && c.id !== activaRef.current)
            .map((c) => [c.id, c.noLeidos]),
        ),
      );
    },
    [],
  );

  useEffect(() => {
    void refrescarTotal();
  }, [refrescarTotal]);

  useEffect(() => {
    if (conversacionActiva) void marcarConversacionLeida(conversacionActiva);
  }, [conversacionActiva, marcarConversacionLeida]);

  useEffect(() => {
    const irAlChat = (conversacionId: string) => () =>
      navigateRef.current(`/chat/${encodeURIComponent(conversacionId)}`);
    const registrarEvento = (
      conversacionId: string,
      tipo: EventoConversacion["tipo"],
    ) =>
      setUltimoEventoConversacion((prev) => ({
        conversacionId,
        tipo,
        seq: (prev?.seq ?? 0) + 1,
      }));

    const offMensaje = chatSocketService.onNotificacionMensaje((payload) => {
      const { conversacionId } = payload;
      if (conversacionId === activaRef.current) {
        void chatSocketService.marcarLeido(conversacionId);
        return;
      }
      setNoLeidosPorConversacion((prev) => ({
        ...prev,
        [conversacionId]: (prev[conversacionId] ?? 0) + 1,
      }));
      setTotalNoLeidos((total) => total + 1);
      registrarEvento(conversacionId, "mensaje");
      addToast(
        `Nuevo mensaje de ${payload.remitenteUsername ?? "Sistema"}: ${payload.preview}`,
        "info",
        TOAST_DURATION,
        { label: "Ver", onClick: irAlChat(conversacionId) },
      );
    });

    const offSolicitud = chatSocketService.onNuevaSolicitudFabricacion(
      (payload) => {
        registrarEvento(payload.conversacionId, "solicitud");
        addToast(
          `Nueva solicitud de fabricación: ${payload.disenoTitulo}`,
          "info",
          TOAST_DURATION,
          { label: "Ver", onClick: irAlChat(payload.conversacionId) },
        );
      },
    );

    return () => {
      offMensaje();
      offSolicitud();
    };
  }, [addToast]);

  const value = useMemo<NotificacionesContextValue>(
    () => ({
      totalNoLeidos,
      noLeidosPorConversacion,
      conversacionActiva,
      setConversacionActiva,
      marcarConversacionLeida,
      sincronizarNoLeidos,
      refrescarTotal,
      ultimoEventoConversacion,
    }),
    [
      totalNoLeidos,
      noLeidosPorConversacion,
      conversacionActiva,
      marcarConversacionLeida,
      sincronizarNoLeidos,
      refrescarTotal,
      ultimoEventoConversacion,
    ],
  );

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} position="top" />
    </NotificacionesContext.Provider>
  );
}

export default NotificacionesProvider;
