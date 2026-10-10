import { useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Send } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button";
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
import {
  AVISO_EN_DISPUTA,
  compraPagada,
  estadoCompraVisual,
  puedeDisputarOrden,
} from "../../utils/estado.util";
import { MAX_MOTIVO_DISPUTA } from "../../interfaces";
import type { ConversacionResumen } from "../../interfaces";
import "./ChatPage.css";

const BREADCRUMB_ITEMS = [{ label: "Inicio", path: "/" }, { label: "Chat" }];

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
    cerrandoTrato,
    handleConfirmarCierre,
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

  return (
    <>
      {conversacion?.productoTitulo && (
        <h3 className="chat-page__product-title">
          {conversacion.productoTitulo}
        </h3>
      )}

      <div className="chat-page__deal-bar">
        <span>
          {dealClosed
            ? `Trato cerrado en $${precioAcordadoValue}`
            : "Negociación en curso"}
        </span>
        {!ordenFabricacionId && (
          <span className="chat-page__deal-bar-note">
            Sin orden de fabricación asociada: no se puede cerrar el trato desde
            este chat.
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
            <div
              key={m.id}
              className={`chat-page__message${
                m.tipo === "propuesta_precio"
                  ? " chat-page__message--proposal"
                  : m.tipo === "sistema"
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
        (conversacion?.miRol === "comprador" ? (
          <div className="chat-page__negotiation">
            <p className="chat-page__negotiation-status">
              {conversacion?.precioPropuestoFabricante != null
                ? `El fabricante propuso $${conversacion.precioPropuestoFabricante}`
                : "El fabricante todavía no propuso un precio."}
            </p>
            <Button
              title="Cerrar trato"
              variant="primary"
              disabled={conversacion?.precioPropuestoFabricante == null}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        ) : (
          <div className="chat-page__negotiation">
            <p className="chat-page__negotiation-status">
              {conversacion?.precioPropuestoFabricante != null
                ? `Propusiste $${conversacion.precioPropuestoFabricante}`
                : "Todavía no propusiste un precio."}
            </p>
            <div className="chat-page__negotiation-actions">
              <Button
                title="Proponer precio"
                variant="outline"
                onClick={handleAbrirProponerModal}
              />
              <Button
                title="Cerrar trato"
                variant="primary"
                disabled={conversacion?.precioPropuestoFabricante == null}
                onClick={() => setConfirmOpen(true)}
              />
            </div>
          </div>
        ))}

      <ConfirmDialog
        open={confirmOpen}
        title="Cerrar trato"
        message={
          conversacion?.miRol === "comprador"
            ? "¿Confirmás cerrar el trato con el fabricante al precio declarado?"
            : "¿Confirmás cerrar el trato al precio que propusiste?"
        }
        details={[
          {
            label: "Precio",
            value: `$${conversacion?.precioPropuestoFabricante}`,
          },
        ]}
        confirmLabel="Confirmar y aceptar"
        variant="info"
        loading={cerrandoTrato}
        onConfirm={handleConfirmarCierre}
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
  } = useConversaciones(addToast);

  const activeConversacion = conversaciones.find(
    (c) => c.id === conversacionId,
  );

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
          <ul className="chat-page__recents">
            {conversaciones.length === 0 && (
              <li className="chat-page__recents-empty">
                {loadingConversaciones
                  ? "Cargando conversaciones..."
                  : "Sin conversaciones recientes."}
              </li>
            )}
            {conversaciones.map((c) => (
              <li key={c.id}>
                <Link
                  className={`chat-page__recent-link${c.id === conversacionId ? " chat-page__recent-link--active" : ""}`}
                  to={`/chat/${c.id}`}
                  state={{ ordenFabricacionId: c.ordenFabricacionId }}
                >
                  <span className="chat-page__recent-name">
                    {c.contraparte.username ||
                      c.contraparte.tagline ||
                      "Usuario"}
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
