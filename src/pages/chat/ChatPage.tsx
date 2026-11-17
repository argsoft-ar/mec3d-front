import { useCallback, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { FileSearch, Send } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import FormField from "../../components/Form/FormField";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import MotivoDialog from "../../components/MotivoDialog/MotivoDialog";
import CodigoEntregaDialog from "../../components/CodigoEntregaDialog/CodigoEntregaDialog";
import {
  DealBar,
  NegotiationPanel,
  PaymentPanel,
  ThreadHeader,
  VER_DISENO_LABEL,
} from "./ChatThreadSections";
import { useToast } from "../../hooks/useToast";
import { useConversaciones } from "../../hooks/useConversaciones";
import { useChatThread } from "../../hooks/useChatThread";
import { useCheckout } from "../../hooks/useCheckout";
import { useCodigoEntrega } from "../../hooks/useCodigoEntrega";
import { useDisputa } from "../../hooks/useDisputa";
import { useCompraDeOrden } from "../../hooks/useCompraDeOrden";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { useSession } from "../../hooks/useSession";
import {
  AVISO_EN_DISPUTA,
  compraPagada,
  estadoCompraVisual,
  puedeDisputarOrden,
} from "../../utils/estado.util";
import { formatPrice } from "../../utils/format.util";
import { rutaDisenoOrden } from "../../utils/redirect.util";
import { MAX_MOTIVO_DISPUTA } from "../../interfaces";
import type { ConversacionResumen, Mensaje } from "../../interfaces";
import type { ChatMessageProps } from "../../components/ChatMessage/ChatMessage.types";
import "./ChatPage.css";

const BREADCRUMB_ITEMS = [{ label: "Inicio", path: "/" }, { label: "Chat" }];

const PREFIJO_NUEVA_SOLICITUD = "Nueva solicitud de fabricación";

/** Acción "VER DISEÑO" en el mensaje de sistema que abre una solicitud de fabricación. */
function accionMensaje(
  m: Mensaje,
  verDiseno: (() => void) | undefined,
): ChatMessageProps["action"] {
  if (
    !verDiseno ||
    m.tipo !== "sistema" ||
    !m.contenido.startsWith(PREFIJO_NUEVA_SOLICITUD)
  )
    return undefined;
  return {
    label: VER_DISENO_LABEL,
    icon: <FileSearch size={14} strokeWidth={2} />,
    onClick: verDiseno,
  };
}

function dealLabelText(
  dealClosed: boolean,
  precioAcordado: number | null | undefined,
): string {
  if (!dealClosed) return "Negociación en curso";
  if (precioAcordado == null) return "Trato cerrado";
  return `Trato cerrado en ${formatPrice(precioAcordado)}`;
}

function precioDetalle(presupuesto: number | null): string {
  return presupuesto == null ? "—" : formatPrice(presupuesto);
}

function recentLinkClassName(activa: boolean, noLeidos: number): string {
  const classes = ["chat-page__recent-link"];
  if (activa) classes.push("chat-page__recent-link--active");
  if (noLeidos > 0) classes.push("chat-page__recent-link--unread");
  return classes.join(" ");
}

function varianteMensaje(
  m: Mensaje,
  currentUserId: string | null,
): NonNullable<ChatMessageProps["variant"]> {
  if (m.tipo === "propuesta_precio") return "proposal";
  if (m.tipo === "sistema") return "system";
  return m.remitenteId === currentUserId ? "own" : "other";
}

interface LocationState {
  ordenFabricacionId?: string;
}

interface ChatThreadProps {
  conversacionId: string;
  ordenFabricacionId?: string;
  currentUserId: string | null;
  conversacion?: ConversacionResumen;
  onDealUpdate: () => void;
  addToast: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
}

// Montado con key={conversacionId} desde ChatPage: al cambiar de conversación
// se remonta por completo, así el estado del hilo (mensajes, precio) arranca limpio.
function ChatThread({
  conversacionId,
  ordenFabricacionId,
  currentUserId,
  conversacion,
  onDealUpdate,
  addToast,
}: Readonly<ChatThreadProps>) {
  const navigate = useNavigate();
  const tratoVigente =
    conversacion?.estadoOrden === "trato_cerrado" ||
    conversacion?.estadoOrden === "confirmada";
  const compra = useCompraDeOrden(
    ordenFabricacionId,
    conversacion?.miRol,
    tratoVigente || conversacion?.estadoOrden === "en_disputa",
  );
  const { paying, pagar } = useCheckout(addToast);
  const codigoEntrega = useCodigoEntrega(addToast);
  const { refresh: refreshCompra } = compra;
  const handleDealUpdate = useCallback(() => {
    onDealUpdate();
    refreshCompra();
  }, [onDealUpdate, refreshCompra]);
  const disputa = useDisputa(addToast, handleDealUpdate);

  const {
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
    aceptandoPresupuesto,
    handleAceptarPresupuesto,
    proponerOpen,
    proponiendoPrecio,
    handleAbrirProponerModal,
    handleCerrarProponerModal,
    handleProponerPrecio,
    dealClosed,
    precioAcordadoValue,
  } = useChatThread({
    conversacionId,
    ordenFabricacionId,
    conversacion,
    onDealUpdate: handleDealUpdate,
    addToast,
  });

  const estadoPago = compra.estado ? estadoCompraVisual(compra.estado) : null;
  const esComprador = conversacion?.miRol === "comprador";
  const pagada = compraPagada(compra.estado);
  const puedeDisputar =
    esComprador && puedeDisputarOrden(conversacion?.estadoOrden, compra.estado);
  const enDisputa = conversacion?.estadoOrden === "en_disputa";
  const esFabricante = conversacion?.miRol === "fabricante";
  const presupuesto = conversacion?.precioPropuestoFabricante ?? null;

  const verDiseno = ordenFabricacionId
    ? () =>
        navigate(rutaDisenoOrden(ordenFabricacionId), {
          state: { conversacionId },
        })
    : undefined;

  return (
    <>
      <ThreadHeader
        productoTitulo={conversacion?.productoTitulo}
        esFabricante={esFabricante}
        onVerDiseno={verDiseno}
      />

      <DealBar
        label={dealLabelText(dealClosed, precioAcordadoValue)}
        sinOrden={!ordenFabricacionId}
      />

      <PaymentPanel
        estadoPago={estadoPago}
        visible={tratoVigente}
        compra={compra}
        ordenFabricacionId={ordenFabricacionId}
        esComprador={esComprador}
        pagada={pagada}
        puedeDisputar={puedeDisputar}
        paying={paying}
        onPagar={pagar}
        onCodigoEntrega={codigoEntrega.abrir}
        onAbrirDisputa={disputa.abrir}
      />

      {enDisputa && (
        <output className="chat-page__dispute-notice">
          <strong>Orden en disputa.</strong> {AVISO_EN_DISPUTA}
        </output>
      )}

      <MotivoDialog
        open={disputa.abierto}
        title="Abrir disputa"
        message="Los fondos quedan congelados y un administrador revisará el caso. Contanos qué pasó: no se puede deshacer."
        fieldLabel="Motivo de la disputa"
        placeholder="Describí el problema con la pieza o la entrega"
        value={disputa.motivo}
        onChange={disputa.handleMotivoChange}
        maxLength={MAX_MOTIVO_DISPUTA}
        error={disputa.error}
        confirmLabel="Abrir disputa"
        cancelLabel="Volver"
        variant="danger"
        loading={disputa.loading}
        confirmDisabled={disputa.invalido}
        onConfirm={disputa.enviar}
        onCancel={disputa.cerrar}
      />

      <CodigoEntregaDialog
        paso={codigoEntrega.paso}
        codigo={codigoEntrega.codigo}
        loading={codigoEntrega.loading}
        onGenerar={codigoEntrega.generar}
        onCerrar={codigoEntrega.cerrar}
      />

      {loadingMensajes ? (
        <PageLoader />
      ) : (
        <div className="chat-page__messages">
          {mensajes.map((m) => (
            <ChatMessage
              key={m.id}
              content={m.contenido}
              variant={varianteMensaje(m, currentUserId)}
              action={accionMensaje(m, verDiseno)}
            />
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
            if (e.key === "Enter") void handleSend();
          }}
          disabled={dealClosed}
        />
        <Button
          title="Enviar"
          icon={<Send size={16} strokeWidth={2} />}
          variant="primary"
          loading={sending}
          disabled={dealClosed}
          onClick={handleSend}
        />
      </div>

      <NegotiationPanel
        visible={!dealClosed && conversacion !== undefined}
        esComprador={esComprador}
        presupuesto={presupuesto}
        ordenFabricacionId={ordenFabricacionId}
        aceptando={aceptandoPresupuesto}
        onAceptar={() => setConfirmOpen(true)}
        onProponer={handleAbrirProponerModal}
      />

      <ConfirmDialog
        open={confirmOpen && esComprador}
        title="Aceptar presupuesto"
        message="Al aceptar se cierra el trato con el fabricante a este precio y te llevamos al pago."
        details={[{ label: "Precio", value: precioDetalle(presupuesto) }]}
        confirmLabel="Aceptar y pagar"
        variant="info"
        loading={aceptandoPresupuesto}
        onConfirm={handleAceptarPresupuesto}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={proponerOpen}
        title="Proponer precio de fabricación"
        message="Ingresá el precio que le vas a proponer al comprador por fabricar este diseño."
        confirmLabel="Proponer precio"
        variant="info"
        loading={proponiendoPrecio}
        confirmDisabled={!precioInput.trim()}
        onConfirm={handleProponerPrecio}
        onCancel={handleCerrarProponerModal}
      >
        <FormField
          label="Precio"
          name="precio-proponer"
          type="number"
          value={precioInput}
          onChange={(e) => setPrecioInput(e.target.value)}
          placeholder="Ej: 15000"
        />
      </ConfirmDialog>
    </>
  );
}

function ChatPage() {
  const { conversacionId } = useParams<{ conversacionId?: string }>();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();
  const { user } = useSession();
  const currentUserId = user?.id ?? null;
  const stateOrdenId = (location.state as LocationState | null)
    ?.ordenFabricacionId;

  const {
    conversaciones,
    loading: loadingConversaciones,
    refresh: refreshConversaciones,
    noLeidosDe,
  } = useConversaciones(addToast);
  const { setConversacionActiva } = useNotificaciones();

  useEffect(() => {
    setConversacionActiva(conversacionId ?? null);
    return () => setConversacionActiva(null);
  }, [conversacionId, setConversacionActiva]);

  const activeConversacion = conversaciones.find(
    (c) => c.id === conversacionId,
  );
  const ordenFabricacionId =
    stateOrdenId ?? activeConversacion?.ordenFabricacionId;

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Chat"
        accentText="de fabricación"
        subtitle="Conversá con el comprador o fabricante: el fabricante envía el presupuesto y el comprador lo acepta."
      />

      <div className="chat-page">
        <aside className="chat-page__sidebar">
          <ul className="chat-page__recents">
            {conversaciones.length === 0 && (
              <li className="chat-page__recents-empty">
                {loadingConversaciones
                  ? "Cargando conversaciones..."
                  : "Sin conversaciones recientes."}
              </li>
            )}
            {conversaciones.map((c) => {
              const noLeidos = noLeidosDe(c.id);
              const nombre =
                c.contraparte.username || c.contraparte.tagline || "Usuario";
              return (
                <li key={c.id}>
                  <Link
                    className={recentLinkClassName(
                      c.id === conversacionId,
                      noLeidos,
                    )}
                    to={`/chat/${c.id}`}
                    state={{ ordenFabricacionId: c.ordenFabricacionId }}
                  >
                    <span className="chat-page__recent-header">
                      <span className="chat-page__recent-name">{nombre}</span>
                      <Badge
                        count={noLeidos}
                        ariaLabel={`${noLeidos} mensajes sin leer`}
                      />
                    </span>
                    {c.productoTitulo && (
                      <span className="chat-page__recent-product">
                        {c.productoTitulo}
                      </span>
                    )}
                    {c.ultimoMensaje && (
                      <span className="chat-page__recent-preview">
                        {c.ultimoMensaje.contenido}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="chat-page__thread">
          {conversacionId ? (
            <ChatThread
              key={conversacionId}
              conversacionId={conversacionId}
              ordenFabricacionId={ordenFabricacionId}
              currentUserId={currentUserId}
              conversacion={activeConversacion}
              onDealUpdate={refreshConversaciones}
              addToast={addToast}
            />
          ) : (
            <p className="chat-page__placeholder">
              Seleccioná una conversación para empezar a chatear.
            </p>
          )}
        </section>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default ChatPage;
