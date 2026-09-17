import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Send } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { chatService } from "../../services/chat.service";
import { chatSocketService } from "../../services/chat-socket.service";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import type { Mensaje, DealClosedPayload } from "../../interfaces";
import "./ChatPage.css";

const RECENTS_KEY = "mec3d_recent_conversations";
const BREADCRUMB_ITEMS = [{ label: "Inicio", path: "/" }, { label: "Chat" }];

interface RecentConversation {
  id: string;
  ordenFabricacionId?: string;
  lastOpened: string;
}

interface LocationState {
  ordenFabricacionId?: string;
}

function getRecents(): RecentConversation[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as RecentConversation[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(entry: RecentConversation): RecentConversation[] {
  const rest = getRecents().filter((r) => r.id !== entry.id);
  const updated = [entry, ...rest].slice(0, 20);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  return updated;
}

function getCurrentUserId(): string | null {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { id?: string }).id ?? null;
  } catch {
    return null;
  }
}

interface ChatThreadProps {
  conversacionId: string;
  ordenFabricacionId?: string;
  currentUserId: string | null;
  onOpened: (entry: RecentConversation) => void;
  addToast: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
}

// Montado con key={conversacionId} desde ChatPage: al cambiar de conversación
// se remonta por completo, así el estado (mensajes, loading, precio) arranca
// limpio sin necesitar resets síncronos dentro de un efecto.
function ChatThread({
  conversacionId,
  ordenFabricacionId,
  currentUserId,
  onOpened,
  addToast,
}: Readonly<ChatThreadProps>) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(true);
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const [precioAcordado, setPrecioAcordado] = useState<number | null>(null);
  const [precioInput, setPrecioInput] = useState("");
  const [cerrandoTrato, setCerrandoTrato] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatService
      .getMensajes(conversacionId)
      .then((res) => setMensajes([...res.data].reverse()))
      .catch(() => addToast("No se pudo cargar el historial", "error"))
      .finally(() => setLoadingMensajes(false));

    onOpened({
      id: conversacionId,
      ordenFabricacionId,
      lastOpened: new Date().toISOString(),
    });

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
      },
    );

    return () => {
      offNuevoMensaje();
      offDealClosed();
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

  async function handleCerrarTrato() {
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
    } catch {
      addToast("No se pudo cerrar el trato", "error");
    } finally {
      setCerrandoTrato(false);
    }
  }

  return (
    <>
      <div className="chat-page__deal-bar">
        <span>
          {precioAcordado !== null
            ? `Trato cerrado en $${precioAcordado}`
            : "Negociación en curso"}
        </span>
        {!ordenFabricacionId && (
          <span className="chat-page__deal-bar-note">
            Sin orden de fabricación asociada: no se puede cerrar el trato desde
            este chat.
          </span>
        )}
      </div>

      {loadingMensajes ? (
        <PageLoader />
      ) : (
        <div className="chat-page__messages">
          {mensajes.map((m) => (
            <div
              key={m.id}
              className={`chat-page__message${
                m.tipo === "sistema"
                  ? " chat-page__message--system"
                  : m.remitenteId === currentUserId
                    ? " chat-page__message--own"
                    : ""
              }`}
            >
              <p>{m.contenido}</p>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>
      )}

      <div className="chat-page__composer">
        <input
          className="chat-page__composer-input"
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          placeholder="Escribí un mensaje..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={precioAcordado !== null}
        />
        <Button
          title="Enviar"
          icon={<Send size={16} strokeWidth={2} />}
          variant="primary"
          loading={sending}
          disabled={precioAcordado !== null}
          onClick={handleSend}
        />
      </div>

      <div className="chat-page__negotiation">
        <FormField
          label="Precio a proponer/confirmar"
          name="precio-cerrar"
          type="number"
          value={precioInput}
          onChange={(e) => setPrecioInput(e.target.value)}
          disabled={precioAcordado !== null}
        />
        <Button
          title={precioAcordado !== null ? "Trato cerrado" : "Cerrar trato"}
          variant="primary"
          disabled={precioAcordado !== null}
          loading={cerrandoTrato}
          onClick={handleCerrarTrato}
        />
      </div>
    </>
  );
}

function ChatPage() {
  const { conversacionId } = useParams<{ conversacionId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const currentUserId = getCurrentUserId();
  const stateOrdenId = (location.state as LocationState | null)
    ?.ordenFabricacionId;

  const [recents, setRecents] = useState<RecentConversation[]>(getRecents);
  const [manualId, setManualId] = useState("");

  function handleOpenManual() {
    if (!manualId.trim()) return;
    navigate(`/chat/${manualId.trim()}`);
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Chat"
        accentText="de fabricación"
        subtitle="Conversá con el comprador o fabricante y cerrá el trato."
      />

      <div className="chat-page">
        <aside className="chat-page__sidebar">
          <div className="chat-page__manual-open">
            <FormField
              label="Abrir conversación por ID"
              name="manual-conversacion"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="ID de conversación"
            />
            <Button
              title="Abrir"
              variant="outline"
              onClick={handleOpenManual}
            />
          </div>

          <ul className="chat-page__recents">
            {recents.length === 0 && (
              <li className="chat-page__recents-empty">
                Sin conversaciones recientes.
              </li>
            )}
            {recents.map((r) => (
              <li key={r.id}>
                <Link
                  className={`chat-page__recent-link${r.id === conversacionId ? " chat-page__recent-link--active" : ""}`}
                  to={`/chat/${r.id}`}
                  state={{ ordenFabricacionId: r.ordenFabricacionId }}
                >
                  {r.id}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-page__thread">
          {conversacionId ? (
            <ChatThread
              key={conversacionId}
              conversacionId={conversacionId}
              ordenFabricacionId={stateOrdenId}
              currentUserId={currentUserId}
              onOpened={(entry) => setRecents(saveRecent(entry))}
              addToast={addToast}
            />
          ) : (
            <p className="chat-page__placeholder">
              Seleccioná o pegá un ID de conversación para empezar a chatear.
            </p>
          )}
        </section>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default ChatPage;
