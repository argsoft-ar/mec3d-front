import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import PurchaseCard from "../../components/PurchaseCard/PurchaseCard";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { compraService, descargarCompra } from "../../services/compra.service";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import type { MisComprasItem } from "../../interfaces";
import type { PurchaseDeliveryStage } from "../../components/PurchaseCard/PurchaseCard.types";
import "./PurchasesPage.css";

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mi Cuenta", path: "/account" },
  { label: "Mis Compras" },
];

function deliveryStageFor(item: MisComprasItem): PurchaseDeliveryStage {
  if (item.ordenFabricacionEstado === "completado") return "completado";
  if (item.ordenFabricacionEstado === "confirmada") return "confirmada";
  if (item.ordenFabricacionEstado === "trato_cerrado") return "trato_cerrado";
  return "none";
}

function PurchasesPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [purchases, setPurchases] = useState<MisComprasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<MisComprasItem | null>(
    null,
  );
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  useEffect(() => {
    compraService
      .misCompras()
      .then(setPurchases)
      .catch(() => addToast("No se pudieron cargar tus compras", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  async function handleDownload(item: MisComprasItem) {
    setDownloadingId(item.id);
    try {
      const ext =
        item.diseno.formato?.split(",")[0]?.trim().toLowerCase() || "zip";
      await descargarCompra(item.id, `${item.diseno.titulo}.${ext}`);
    } catch {
      addToast("Error al descargar el archivo", "error");
    } finally {
      setDownloadingId(null);
    }
  }

  function handleSolicitarFabricacion(item: MisComprasItem) {
    navigate(`/product/${item.idModelo}/fabricantes`, {
      state: { compraId: item.id },
    });
  }

  async function openConfirmDelivery(item: MisComprasItem) {
    setConfirmingItem(item);
    setCodigo(null);
    if (!item.ordenFabricacionId) return;
    setLoadingCodigo(true);
    try {
      const res = await ordenFabricacionService.codigoEntrega(
        item.ordenFabricacionId,
      );
      setCodigo(res.data?.codigoEntrega ?? null);
    } catch {
      addToast("No se pudo obtener el código de entrega", "error");
    } finally {
      setLoadingCodigo(false);
    }
  }

  async function handleConfirmDelivery() {
    if (!confirmingItem?.ordenFabricacionId) return;
    setSubmittingConfirm(true);
    try {
      await ordenFabricacionService.declararEntrega(
        confirmingItem.ordenFabricacionId,
      );
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === confirmingItem.id
            ? { ...p, ordenFabricacionEstado: "confirmada" }
            : p,
        ),
      );
      addToast(
        "Entrega confirmada, esperando validación del fabricante",
        "success",
      );
      setConfirmingItem(null);
    } catch {
      addToast("No se pudo confirmar la entrega", "error");
    } finally {
      setSubmittingConfirm(false);
    }
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Mis"
        accentText="Compras"
        subtitle="Descargá tus diseños comprados y confirmá la entrega."
      />

      {loading ? (
        <PageLoader />
      ) : purchases.length === 0 ? (
        <p className="purchases-page__empty">Todavía no tenés compras.</p>
      ) : (
        <div className="purchases-page__list">
          {purchases.map((item) => (
            <PurchaseCard
              key={item.id}
              imageUrl={item.diseno.imagenUrl ?? ""}
              title={item.diseno.titulo}
              format={item.diseno.formato ?? ""}
              pricePaid={item.precioPagado}
              deliveryStage={deliveryStageFor(item)}
              downloading={downloadingId === item.id}
              onDownload={() => handleDownload(item)}
              onSolicitarFabricacion={() => handleSolicitarFabricacion(item)}
              onConfirmarEntrega={() => openConfirmDelivery(item)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmingItem !== null}
        title="Confirmar entrega"
        message="Brindale estos 6 dígitos al fabricante para confirmar que recibiste la pieza. No lo hagas si todavía no la recibiste."
        confirmLabel="Confirmar entrega"
        cancelLabel="Cancelar"
        variant="warning"
        loading={submittingConfirm}
        confirmDisabled={loadingCodigo || !codigo}
        onConfirm={handleConfirmDelivery}
        onCancel={() => setConfirmingItem(null)}
      >
        <div className="purchases-page__codigo-display">
          <KeyRound size={16} strokeWidth={2} />
          <span>{loadingCodigo ? "Cargando código..." : (codigo ?? "—")}</span>
        </div>
      </ConfirmDialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default PurchasesPage;
