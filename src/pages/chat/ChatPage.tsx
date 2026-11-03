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
import MaterialTag from "../../components/MaterialTag/MaterialTag";
import { useToast } from "../../hooks/useToast";
import { useConversaciones } from "../../hooks/useConversaciones";
import { useChatThread } from "../../hooks/useChatThread";
import { useCheckout } from "../../hooks/useCheckout";
import { useCodigoEntrega } from "../../hooks/useCodigoEntrega";
import { useDisputa } from "../../hooks/useDisputa";
import { useCompraDeOrden } from "../../hooks/useCompraDeOrden";
import { useNotificaciones } from "../../hooks/useNotificaciones";
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
const VER_DISENO_LABEL = "VER DISEÑO";

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

  const accionMensaje = (m: Mensaje): ChatMessageProps["action"] =>
    verDiseno &&
    m.tipo === "sistema" &&
    m.contenido.startsWith(PREFIJO_NUEVA_SOLICITUD)
      ? {
          label: VER_DISENO_LABEL,
          icon: <FileSearch size={14} strokeWidth={2} />,
          onClick: verDiseno,
        }
      : undefined;

  return (
    <>
      <div className="chat-page__thread-header">
        {conversacion?.productoTitulo && (
          <h3 className="chat-page__product-title">
            {conversacion.productoTitulo}
          </h3>
        )}
        {verDiseno && (
          <Button
            title={VER_DISENO_LABEL}
            variant={esFabricante ? "primary" : "outline"}
            icon={<FileSearch size={16} strokeWidth={2} />}
            onClick={verDiseno}
          />
        )}
      </div>

      <div className="chat-page__deal-bar">
        <span>
          {dealClosed
            ? precioAcordadoValue != null
              ? `Trato cerrado en ${formatPrice(precioAcordadoValue)}`
              : "Trato cerrado"
            : "Negociación en curso"}
        </span>
        {!ordenFabricacionId && (
          <span className="chat-page__deal-bar-note">
            Sin orden de fabricación asociada: no se puede aceptar un
            presupuesto desde este chat.
          </span>
        )}
      </div>

      {estadoPago && tratoVigente && (
        <div className="chat-page__delivery-code">
          <MaterialTag
            label={`Pago: ${estadoPago.label}`}
            variant={estadoPago.variant}
            size="sm"
          />
          {esComprador &&
            compra.estado === "pendiente_pago" &&
            compra.compraId && (
              <Button
                title="Pagar"
                variant="primary"
                loading={paying}
                onClick={() => pagar(compra.compraId as string)}
              />
            )}
          {esComprador && pagada && ordenFabricacionId && (
            <Button
              title="Código de entrega"
              variant="outline"
              onClick={() => codigoEntrega.abrir(ordenFabricacionId)}
            />
          )}
          {puedeDisputar && ordenFabricacionId && (
            <Button
              title="Abrir disputa"
              variant="danger"
              onClick={() => disputa.abrir(ordenFabricacionId)}
            />
          )}
        </div>
      )}

      {enDisputa && (
        <p className="chat-page__dispute-notice" role="status">
          <strong>Orden en disputa.</strong> {AVISO_EN_DISPUTA}
        </p>
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
              action={accionMensaje(m)}
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
            if (e.key === "Enter") handleSend();
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

      {!dealClosed &&
        conversacion &&
        (esComprador ? (
          <div className="chat-page__negotiation">
            <p className="chat-page__negotiation-status">
              {presupuesto != null
                ? `El fabricante te envió un presupuesto de ${formatPrice(presupuesto)}`
                : "El fabricante todavía no envió un presupuesto."}
            </p>
            <Button
              title={
                presupuesto != null
                  ? `Aceptar presupuesto ${formatPrice(presupuesto)}`
                  : "Aceptar presupuesto"
              }
              variant="primary"
              disabled={presupuesto == null || !ordenFabricacionId}
              loading={aceptandoPresupuesto}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        ) : (
          <div className="chat-page__negotiation">
            <p className="chat-page__negotiation-status">
              {presupuesto != null
                ? `Propusiste ${formatPrice(presupuesto)}. Esperando que el comprador acepte el presupuesto.`
                : "Todavía no propusiste un precio."}
            </p>
            <div className="chat-page__negotiation-actions">
              <Button
                title={
                  presupuesto != null ? "Cambiar precio" : "Proponer precio"
                }
                variant="primary"
                disabled={!ordenFabricacionId}
                onClick={handleAbrirProponerModal}
              />
            </div>
          </div>
        ))}

      <ConfirmDialog
        open={confirmOpen && esComprador}
        title="Aceptar presupuesto"
        message="Al aceptar se cierra el trato con el fabricante a este precio y te llevamos al pago."
        details={[
          {
            label: "Precio",
            value: presupuesto != null ? formatPrice(presupuesto) : "—",
          },
        ]}
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
  const currentUserId = getCurrentUserId();
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
                    className={`chat-page__recent-link${c.id === conversacionId ? " chat-page__recent-link--active" : ""}${noLeidos > 0 ? " chat-page__recent-link--unread" : ""}`}
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
