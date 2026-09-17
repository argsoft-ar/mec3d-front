import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import PurchaseCard from "../../components/PurchaseCard/PurchaseCard";
import FormField from "../../components/Form/FormField";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { compraService, descargarCompra } from "../../services/compra.service";
import type { MisComprasItem } from "../../interfaces";
import "./PurchasesPage.css";

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mi Cuenta", path: "/account" },
  { label: "Mis Compras" },
];

function PurchasesPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [purchases, setPurchases] = useState<MisComprasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [submittingToken, setSubmittingToken] = useState(false);

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

  function openConfirmDelivery(id: string) {
    setConfirmingId(id);
    setTokenInput("");
  }

  async function handleConfirmDelivery(id: string) {
    if (!tokenInput.trim()) return;
    setSubmittingToken(true);
    try {
      await compraService.confirmarEntrega(id, tokenInput.trim());
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, entregaConfirmada: true } : p)),
      );
      addToast("Entrega confirmada", "success");
      setConfirmingId(null);
    } catch {
      addToast("Token inválido o error al confirmar", "error");
    } finally {
      setSubmittingToken(false);
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
              entregaConfirmada={item.entregaConfirmada}
              downloading={downloadingId === item.id}
              onDownload={() => handleDownload(item)}
              onConfirmarEntrega={() => openConfirmDelivery(item.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmingId !== null}
        title="Confirmar entrega"
        message="Pegá el código de verificación que recibiste al comprar para confirmar la entrega y liberar los fondos."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="info"
        loading={submittingToken}
        confirmDisabled={!tokenInput.trim()}
        onConfirm={() => confirmingId && handleConfirmDelivery(confirmingId)}
        onCancel={() => setConfirmingId(null)}
      >
        <FormField
          label="Código de verificación"
          name="token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Pegá el código que recibiste al comprar"
        />
      </ConfirmDialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default PurchasesPage;
