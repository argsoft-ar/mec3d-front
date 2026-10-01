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
import { useToast } from "../../hooks/useToast";
import { useConversaciones } from "../../hooks/useConversaciones";
import { useChatThread } from "../../hooks/useChatThread";
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
    codigoEntrega,
    loadingCodigo,
    handleVerCodigoEntrega,
    dealClosed,
    precioAcordadoValue,
  } = useChatThread({
    conversacionId,
    ordenFabricacionId,
    conversacion,
    onDealUpdate,
    addToast,
  });

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

      {conversacion?.miRol === "comprador" &&
        (conversacion?.estadoOrden === "trato_cerrado" ||
          conversacion?.estadoOrden === "confirmada") && (
          <div className="chat-page__delivery-code">
            {codigoEntrega ? (
              <span className="chat-page__delivery-code-value">
                Código de entrega: <strong>{codigoEntrega}</strong>
              </span>
            ) : (
              <Button
                title="Ver código de entrega"
                variant="outline"
                loading={loadingCodigo}
                onClick={handleVerCodigoEntrega}
              />
            )}
          </div>
        )}

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
