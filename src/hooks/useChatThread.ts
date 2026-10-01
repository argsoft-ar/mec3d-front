import { useState, useEffect, useRef, type RefObject } from "react";
import { chatService } from "../services/chat.service";
import { chatSocketService } from "../services/chat-socket.service";
import { ordenFabricacionService } from "../services/orden-fabricacion.service";
import type {
  Mensaje,
  DealClosedPayload,
  ConversacionResumen,
} from "../interfaces";
import type { ToastType } from "../types";

interface UseChatThreadParams {
  conversacionId: string;
  ordenFabricacionId?: string;
  conversacion?: ConversacionResumen;
  onDealUpdate: () => void;
  addToast: (message: string, type: ToastType) => void;
}

interface UseChatThreadReturn {
  mensajes: Mensaje[];
  loadingMensajes: boolean;
  threadEndRef: RefObject<HTMLDivElement | null>;

  composerText: string;
  setComposerText: (value: string) => void;
  sending: boolean;
  handleSend: () => Promise<void>;

  precioInput: string;
  setPrecioInput: (value: string) => void;

  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  cerrandoTrato: boolean;
  handleConfirmarCierre: () => void;

  proponerOpen: boolean;
  proponiendoPrecio: boolean;
  handleAbrirProponerModal: () => void;
  handleCerrarProponerModal: () => void;
  handleProponerPrecio: () => Promise<void>;

  codigoEntrega: string | null;
  loadingCodigo: boolean;
  handleVerCodigoEntrega: () => Promise<void>;

  dealClosed: boolean;
  precioAcordadoValue: number | null;
}

// Toda la lógica de negociación/tiempo real de un hilo de chat vive acá para
// que el componente de UI (ChatThread) quede puramente de presentación.
export function useChatThread({
  conversacionId,
  ordenFabricacionId,
  conversacion,
  onDealUpdate,
  addToast,
}: UseChatThreadParams): UseChatThreadReturn {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(true);
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const [precioAcordado, setPrecioAcordado] = useState<number | null>(null);
  const [precioInput, setPrecioInput] = useState("");
  const [cerrandoTrato, setCerrandoTrato] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [proponerOpen, setProponerOpen] = useState(false);
  const [proponiendoPrecio, setProponiendoPrecio] = useState(false);
  const [codigoEntrega, setCodigoEntrega] = useState<string | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatService
      .getMensajes(conversacionId)
      .then((res) => setMensajes([...res.data].reverse()))
      .catch(() => addToast("No se pudo cargar el historial", "error"))
      .finally(() => setLoadingMensajes(false));

    chatSocketService.joinConversacion(conversacionId).then((ack) => {
      if (!ack.ok) addToast(ack.error ?? "No se pudo unir al chat", "error");
    });

    const offNuevoMensaje = chatSocketService.onNuevoMensaje((mensaje) => {
      if (mensaje.conversacionId !== conversacionId) return;
      setMensajes((prev) =>
        prev.some((m) => m.id === mensaje.id) ? prev : [...prev, mensaje],
      );
    });

    const offDealClosed = chatSocketService.onDealClosed(
      (payload: DealClosedPayload) => {
        if (payload.ordenFabricacionId !== ordenFabricacionId) return;
        setPrecioAcordado(payload.precioAcordado);
        setMensajes((prev) =>
          prev.some((m) => m.id === payload.mensaje.id)
            ? prev
            : [...prev, payload.mensaje],
        );
        addToast("¡Trato cerrado!", "success");
        onDealUpdate();
      },
    );

    // Corrige el bug de "chat no instantáneo": proponer-precio es un endpoint REST
    // que ahora emite este evento para que la otra parte lo vea sin refrescar, y
    // embebe la propuesta como un mensaje visible en el hilo (no solo un estado aparte).
    const offPrecioPropuesto = chatSocketService.onPrecioPropuesto(
      (payload) => {
        if (payload.ordenFabricacionId !== ordenFabricacionId) return;
        setMensajes((prev) =>
          prev.some((m) => m.id === payload.mensaje.id)
            ? prev
            : [...prev, payload.mensaje],
        );
        onDealUpdate();
      },
    );

    const offOrdenCompletada = chatSocketService.onOrdenCompletada(
      (payload) => {
        if (payload.ordenFabricacionId !== ordenFabricacionId) return;
        setCodigoEntrega(null);
        setMensajes((prev) =>
          prev.some((m) => m.id === payload.mensaje.id)
            ? prev
            : [...prev, payload.mensaje],
        );
        addToast("Entrega confirmada", "success");
        onDealUpdate();
      },
    );

    const offEntregaDeclarada = chatSocketService.onEntregaDeclarada(
      (payload) => {
        if (payload.ordenFabricacionId !== ordenFabricacionId) return;
        setMensajes((prev) =>
          prev.some((m) => m.id === payload.mensaje.id)
            ? prev
            : [...prev, payload.mensaje],
        );
        onDealUpdate();
      },
    );

    return () => {
      offNuevoMensaje();
      offDealClosed();
      offPrecioPropuesto();
      offOrdenCompletada();
      offEntregaDeclarada();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversacionId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function handleSend() {
    if (!composerText.trim()) return;
    setSending(true);
    try {
      const ack = await chatSocketService.enviarMensaje(
        conversacionId,
        composerText.trim(),
      );
      if (!ack.ok) {
        addToast(ack.error ?? "No se pudo enviar el mensaje", "error");
      } else {
        setComposerText("");
      }
    } finally {
      setSending(false);
    }
  }

  async function handleCerrarTrato(precio: number) {
    if (!ordenFabricacionId) {
      addToast(
        "No hay una orden de fabricación asociada a este chat",
        "warning",
      );
      return;
    }
    setCerrandoTrato(true);
    try {
      const res = await ordenFabricacionService.cerrarTrato(
        ordenFabricacionId,
        precio,
      );
      if (
        res.data?.estado === "trato_cerrado" &&
        res.data.precioAcordado !== null
      ) {
        setPrecioAcordado(res.data.precioAcordado);
        addToast("¡Trato cerrado!", "success");
      } else {
        addToast("Precio confirmado, esperando a la otra parte", "info");
      }
      onDealUpdate();
    } catch {
      addToast("No se pudo cerrar el trato", "error");
    } finally {
      setCerrandoTrato(false);
    }
  }

  function handleConfirmarCierre() {
    const precio = conversacion?.precioPropuestoFabricante;
    if (precio == null || Number.isNaN(precio) || precio <= 0) {
      addToast("Precio inválido", "warning");
      return;
    }
    handleCerrarTrato(precio).then(() => setConfirmOpen(false));
  }

  function handleAbrirProponerModal() {
    setPrecioInput(
      conversacion?.precioPropuestoFabricante != null
        ? String(conversacion.precioPropuestoFabricante)
        : "",
    );
    setProponerOpen(true);
  }

  function handleCerrarProponerModal() {
    setProponerOpen(false);
  }

  async function handleProponerPrecio() {
    if (!ordenFabricacionId) {
      addToast(
        "No hay una orden de fabricación asociada a este chat",
        "warning",
      );
      return;
    }
    const precio = Number.parseFloat(precioInput);
    if (Number.isNaN(precio) || precio <= 0) {
      addToast("Ingresá un precio válido", "warning");
      return;
    }
    setProponiendoPrecio(true);
    try {
      await ordenFabricacionService.proponerPrecio(ordenFabricacionId, precio);
      addToast("Precio propuesto", "success");
      setProponerOpen(false);
      onDealUpdate();
    } catch {
      addToast("No se pudo proponer el precio", "error");
    } finally {
      setProponiendoPrecio(false);
    }
  }

  async function handleVerCodigoEntrega() {
    if (!ordenFabricacionId) return;
    setLoadingCodigo(true);
    try {
      const res =
        await ordenFabricacionService.codigoEntrega(ordenFabricacionId);
      setCodigoEntrega(res.data?.codigoEntrega ?? null);
    } catch {
      addToast("No se pudo obtener el código de entrega", "error");
    } finally {
      setLoadingCodigo(false);
    }
  }

  // El estado local solo se actualiza vía eventos de socket dentro de esta sesión;
  // se combina con la conversación (ya persistida) para que, al reabrir un chat
  // cuyo trato ya estaba cerrado, el botón de cerrar trato no vuelva a aparecer.
  const dealClosed =
    precioAcordado !== null ||
    conversacion?.estadoOrden === "trato_cerrado" ||
    conversacion?.estadoOrden === "completado";
  const precioAcordadoValue =
    precioAcordado ?? conversacion?.precioAcordado ?? null;

  return {
    mensajes,
    loadingMensajes,
    threadEndRef,

    composerText,
    setComposerText,
    sending,
    handleSend,

    precioInput,
    setPrecioInput,

    confirmOpen,
    setConfirmOpen,
    cerrandoTrato,
    handleConfirmarCierre,

    proponerOpen,
    proponiendoPrecio,
    handleAbrirProponerModal,
    handleCerrarProponerModal,
    handleProponerPrecio,

    codigoEntrega,
    loadingCodigo,
    handleVerCodigoEntrega,

    dealClosed,
    precioAcordadoValue,
  };
}
