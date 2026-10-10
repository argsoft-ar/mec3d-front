import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import PurchaseCard from "../../components/PurchaseCard/PurchaseCard";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import CodigoEntregaDialog from "../../components/CodigoEntregaDialog/CodigoEntregaDialog";
import MotivoDialog from "../../components/MotivoDialog/MotivoDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { useCheckout } from "../../hooks/useCheckout";
import { useCodigoEntrega } from "../../hooks/useCodigoEntrega";
import { useDisputa } from "../../hooks/useDisputa";
import { compraService, descargarCompra } from "../../services/compra.service";
import { getErrorMessage } from "../../services/http.client";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import { MAX_MOTIVO_DISPUTA } from "../../interfaces";
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
  if (item.ordenFabricacionEstado === "en_disputa") return "en_disputa";
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
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const { pagar } = useCheckout(addToast);
  const codigoEntrega = useCodigoEntrega(addToast);
  const marcarEnDisputa = useCallback((ordenId: string) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.ordenFabricacionId === ordenId
          ? { ...p, ordenFabricacionEstado: "en_disputa" }
          : p,
      ),
    );
  }, []);
  const disputa = useDisputa(addToast, marcarEnDisputa);

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
    } catch (error) {
      addToast(
        getErrorMessage(error, "Error al descargar el archivo"),
        "error",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handlePagar(item: MisComprasItem) {
    setPayingId(item.id);
    const redirigido = await pagar(item.id);
    // Si se redirige a Mercado Pago, la página se descarga y el botón queda en carga.
    if (!redirigido) setPayingId(null);
  }

  function handleSolicitarFabricacion(item: MisComprasItem) {
    navigate(`/product/${item.idModelo}/fabricantes`, {
      state: { compraId: item.id, material: item.material },
    });
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
    } catch (error) {
      addToast(
        getErrorMessage(error, "No se pudo confirmar la entrega"),
        "error",
      );
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
              material={item.material}
              pricePaid={item.precioPagado}
              tipo={item.tipo}
              estadoCompra={item.estado}
              deliveryStage={deliveryStageFor(item)}
              downloading={downloadingId === item.id}
              paying={payingId === item.id}
              onDownload={() => handleDownload(item)}
              onPagar={() => handlePagar(item)}
              onSolicitarFabricacion={() => handleSolicitarFabricacion(item)}
              onConfirmarEntrega={() => setConfirmingItem(item)}
              onGenerarCodigo={
                item.ordenFabricacionId
                  ? () => codigoEntrega.abrir(item.ordenFabricacionId as string)
                  : undefined
              }
              onAbrirDisputa={
                item.ordenFabricacionId
                  ? () => disputa.abrir(item.ordenFabricacionId as string)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmingItem !== null}
        title="Confirmar entrega"
        message="Confirmá solo si ya recibiste la pieza. Después vas a poder generar el código de 6 dígitos que el fabricante necesita para validar la entrega."
        confirmLabel="Confirmar entrega"
        cancelLabel="Cancelar"
        variant="warning"
        loading={submittingConfirm}
        onConfirm={handleConfirmDelivery}
        onCancel={() => setConfirmingItem(null)}
      />

      <CodigoEntregaDialog
        paso={codigoEntrega.paso}
        codigo={codigoEntrega.codigo}
        loading={codigoEntrega.loading}
        onGenerar={codigoEntrega.generar}
        onCerrar={codigoEntrega.cerrar}
      />

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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default PurchasesPage;
