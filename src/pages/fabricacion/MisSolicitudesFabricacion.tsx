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

  useEffect(() => {
    ordenFabricacionService
      .misSolicitudes()
      .then((res) => setOrdenes(res.data ?? []))
      .catch(() => addToast("No se pudieron cargar las solicitudes", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDescargar(orden: OrdenFabricacionListItem) {
    setDownloadingId(orden.id);
    try {
      await descargarDisenoOrden(orden.id, orden.productoTitulo);
    } catch {
      addToast("No se pudo descargar el archivo", "error");
    } finally {
      setDownloadingId(null);
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
    } catch {
      addToast("Código de entrega inválido", "error");
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
            onChange={(e) => setCodigoInput(e.target.value)}
            placeholder="000000"
          />
        </label>
      </ConfirmDialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default MisSolicitudesFabricacion;
