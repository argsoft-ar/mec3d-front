import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import SolicitudFabricacionCard from "../../components/SolicitudFabricacionCard/SolicitudFabricacionCard";
import { useToast } from "../../hooks/useToast";
import {
  ordenFabricacionService,
  descargarDisenoOrden,
} from "../../services/orden-fabricacion.service";
import {
  HttpError,
  getErrorMessage,
  getErrorToast,
} from "../../services/http.client";
import { compraPagada, mensajeReembolso } from "../../utils/estado.util";
import type { OrdenFabricacionListItem } from "../../interfaces";
import "./MisSolicitudesFabricacion.css";

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mis solicitudes de fabricación" },
];

function MisSolicitudesFabricacion() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [ordenes, setOrdenes] = useState<OrdenFabricacionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [cancelando, setCancelando] = useState<OrdenFabricacionListItem | null>(
    null,
  );
  const [procesandoCancelacion, setProcesandoCancelacion] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cargar() {
    ordenFabricacionService
      .misSolicitudes()
      .then((res) => setOrdenes(res.data ?? []))
      .catch(() => addToast("No se pudieron cargar las solicitudes", "error"))
      .finally(() => setLoading(false));
  }

  async function handleDescargar(orden: OrdenFabricacionListItem) {
    setDownloadingId(orden.id);
    try {
      await descargarDisenoOrden(orden.id, orden.productoTitulo);
    } catch (error) {
      addToast(
        getErrorMessage(error, "No se pudo descargar el archivo"),
        "error",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleCancelar() {
    if (!cancelando) return;
    setProcesandoCancelacion(true);
    try {
      const res = await ordenFabricacionService.cancelar(cancelando.id);
      const { message, type } = mensajeReembolso(res.reembolso);
      setOrdenes((prev) => prev.filter((o) => o.id !== cancelando.id));
      addToast(message, type);
      setCancelando(null);
    } catch (error) {
      const { message, type } = getErrorToast(
        error,
        "No se pudo cancelar la orden",
      );
      addToast(message, type);
      // 409: el estado de la orden cambió (p. ej. disputa abierta); se recarga la lista.
      if (error instanceof HttpError && error.status === 409) {
        setCancelando(null);
        cargar();
      }
    } finally {
      setProcesandoCancelacion(false);
    }
  }

  function openConfirmarEntrega(ordenId: string) {
    setConfirmandoId(ordenId);
    setCodigoInput("");
  }

  async function handleConfirmarEntrega() {
    if (!confirmandoId || !/^\d{6}$/.test(codigoInput.trim())) {
      addToast("Ingresá el código de 6 dígitos", "warning");
      return;
    }
    setConfirmandoEntrega(true);
    try {
      await ordenFabricacionService.confirmarEntrega(
        confirmandoId,
        codigoInput.trim(),
      );
      // La orden completada se oculta de "mis solicitudes" para el fabricante.
      setOrdenes((prev) => prev.filter((o) => o.id !== confirmandoId));
      addToast("Entrega confirmada", "success");
      setConfirmandoId(null);
    } catch (error) {
      // 400: código inválido con intentos restantes; 429: orden bloqueada por exceso de intentos.
      if (error instanceof HttpError && error.status === 429) {
        addToast(error.message, "error");
        setConfirmandoId(null);
      } else {
        addToast(
          getErrorMessage(error, "No se pudo confirmar la entrega"),
          "error",
        );
      }
    } finally {
      setConfirmandoEntrega(false);
    }
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Mis solicitudes de"
        accentText="fabricación"
        subtitle="Abrí el chat para negociar el precio y, una vez cerrado el trato, descargá el diseño y confirmá la entrega."
      />

      {loading ? (
        <PageLoader />
      ) : ordenes.length === 0 ? (
        <p className="mis-solicitudes__empty">
          No tenés solicitudes de fabricación pendientes.
        </p>
      ) : (
        <div className="mis-solicitudes__list">
          {ordenes.map((orden) => (
            <SolicitudFabricacionCard
              key={orden.id}
              orden={orden}
              downloading={downloadingId === orden.id}
              onDescargar={() => handleDescargar(orden)}
              onConfirmarEntrega={() => openConfirmarEntrega(orden.id)}
              onCancelar={() => setCancelando(orden)}
              onAbrirChat={() =>
                navigate(`/chat/${orden.conversacionId}`, {
                  state: { ordenFabricacionId: orden.id },
                })
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmandoId !== null}
        title="Confirmar entrega"
        message="Ingresá el código de 6 dígitos que te mostró el comprador al momento de la entrega."
        confirmLabel="Confirmar entrega"
        variant="info"
        loading={confirmandoEntrega}
        confirmDisabled={!/^\d{6}$/.test(codigoInput.trim())}
        onConfirm={handleConfirmarEntrega}
        onCancel={() => setConfirmandoId(null)}
      >
        <label
          className="mis-solicitudes__codigo-input"
          htmlFor="codigo-entrega"
        >
          <KeyRound size={16} strokeWidth={2} />
          <input
            id="codigo-entrega"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codigoInput}
            onChange={(e) =>
              setCodigoInput(e.target.value.replaceAll(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            autoComplete="one-time-code"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelando !== null}
        title="Cancelar orden"
        message={
          cancelando && compraPagada(cancelando.compraEstado)
            ? "El comprador ya pagó: al cancelar se le reembolsa el pago. Esta acción no se puede deshacer."
            : "Esta acción no se puede deshacer."
        }
        confirmLabel="Cancelar orden"
        cancelLabel="Volver"
        variant="danger"
        loading={procesandoCancelacion}
        onConfirm={handleCancelar}
        onCancel={() => setCancelando(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default MisSolicitudesFabricacion;
