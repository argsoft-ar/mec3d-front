import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Hammer } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { productService } from "../../services/product.service";
import { compraService, descargarCompra } from "../../services/compra.service";
import type { Product } from "../../interfaces/product.interface";
import type { CrearCompraResponse } from "../../interfaces";
import type { ButtonVariant } from "../../types";
import "./PurchaseDecision.css";

type ChosenPath = "download" | "fabricacion" | null;

interface PurchaseOption {
  icon: ReactNode;
  title: string;
  text: string;
  buttonTitle: string;
  buttonVariant: ButtonVariant;
  processingKey: ChosenPath;
  onClick: () => void;
}

function fileExtensionFor(format?: string): string {
  return format?.split(",")[0]?.trim().toLowerCase() || "zip";
}

function PurchaseDecision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<ChosenPath>(null);
  const [result, setResult] = useState<CrearCompraResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    productService
      .getAll()
      .then((res) => setProduct(res.data.find((p) => p.id === id) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownloadNow() {
    if (!id) return;
    setProcessing("download");
    try {
      const res = await compraService.crear(id);
      setResult(res);
      setDownloading(true);
      await descargarCompra(
        res.data.id,
        `${product?.title ?? "diseno"}.${fileExtensionFor(product?.format)}`,
      );
      addToast("Descarga iniciada", "success");
    } catch {
      addToast("No se pudo procesar la compra", "error");
    } finally {
      setProcessing(null);
      setDownloading(false);
    }
  }

  async function handleRequestFabricacion() {
    if (!id) return;
    setProcessing("fabricacion");
    try {
      const res = await compraService.crear(id);
      // Redirige directo al listado de fabricantes: no hay ningún token ni paso
      // intermedio que mostrar acá.
      navigate(`/product/${id}/fabricantes`, {
        state: { compraId: res.data.id },
      });
    } catch {
      addToast("No se pudo procesar la compra", "error");
      setProcessing(null);
    }
  }

  const purchaseOptions: PurchaseOption[] = [
    {
      icon: <Download size={32} strokeWidth={1.5} />,
      title: "Descargar ahora",
      text: "Comprá el diseño digital y descargalo inmediatamente en tu dispositivo.",
      buttonTitle: "Descargar ahora",
      buttonVariant: "primary",
      processingKey: "download",
      onClick: handleDownloadNow,
    },
    {
      icon: <Hammer size={32} strokeWidth={1.5} />,
      title: "Solicitar fabricación",
      text: "Comprá el diseño y pedí presupuesto a fabricantes para recibir la pieza impresa en tus manos.",
      buttonTitle: "Solicitar fabricación",
      buttonVariant: "outline",
      processingKey: "fabricacion",
      onClick: handleRequestFabricacion,
    },
  ];

  if (loading)
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );

  if (!product)
    return (
      <Layout>
        <p style={{ padding: "2rem" }}>Producto no encontrado.</p>
      </Layout>
    );

  const breadcrumbItems = [
    { label: "Inicio", path: "/" },
    { label: "Explorar", path: "/explore" },
    { label: product.title, path: `/product/${id}` },
    { label: "Comprar" },
  ];

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />
      <Header
        title="Comprar"
        accentText={product.title}
        subtitle="Elegí cómo querés recibir tu pieza."
      />

      {!result && (
        <div className="purchase-decision__options">
          {purchaseOptions.map((option) => (
            <Card
              key={option.title}
              variant="option"
              className="purchase-decision__option"
              icon={option.icon}
              title={option.title}
              text={option.text}
              footer={
                <Button
                  title={option.buttonTitle}
                  variant={option.buttonVariant}
                  fullWidth
                  loading={processing === option.processingKey}
                  onClick={option.onClick}
                />
              }
            />
          ))}
        </div>
      )}

      {result && (
        <div className="purchase-decision__actions">
          <Button
            title={downloading ? "Descargando..." : "Descargar de nuevo"}
            variant="primary"
            loading={downloading}
            onClick={() =>
              descargarCompra(
                result.data.id,
                `${product.title}.${fileExtensionFor(product.format)}`,
              )
            }
          />
          <Button
            title="Ir a Mis Compras"
            variant="ghost"
            onClick={() => navigate("/account/purchases")}
          />
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default PurchaseDecision;
