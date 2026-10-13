import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Download, Hammer } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import MaterialTagList from "../../components/MaterialTag/MaterialTagList";
import ToastContainer from "../../components/Toast/ToastContainer";
import PageLoader from "../../components/PageLoader/PageLoader";
import { useToast } from "../../hooks/useToast";
import { productService } from "../../services/product.service";
import { useCompraDescarga } from "../../hooks/useCompraDescarga";
import { compraService } from "../../services/compra.service";
import { getErrorMessage, isNotFoundError } from "../../services/http.client";
import { esPlanoTecnico } from "../../utils/product.util";
import type { Product } from "../../interfaces/product.interface";
import type { ButtonVariant } from "../../types";
import "./PurchaseDecision.css";

type ChosenPath = "download" | "fabricacion" | null;

interface PurchaseOption {
  icon: ReactNode;
  title: string;
  text: string;
  /** Etapas del flujo, en orden */
  steps: string[];
  buttonTitle: string;
  buttonVariant: ButtonVariant;
  processingKey: ChosenPath;
  onClick: () => void;
  /** Contenido opcional (ej. selector) mostrado dentro de la tarjeta */
  extra?: ReactNode;
}

function PurchaseDecision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<ChosenPath>(null);
  const descarga = useCompraDescarga(addToast);
  const activePath: ChosenPath = descarga.processing ? "download" : processing;
  const [material, setMaterial] = useState("");
  const [materialError, setMaterialError] = useState<string | undefined>();

  const materiales = product?.materiales ?? [];
  // Con un único material posible no hay nada que elegir.
  const selectedMaterial =
    material || (materiales.length === 1 ? materiales[0] : "");

  useEffect(() => {
    if (!id) return;
    productService
      .getById(id)
      .then(setProduct)
      .catch((error: unknown) => {
        setProduct(null);
        if (!isNotFoundError(error))
          addToast(
            getErrorMessage(error, "No se pudo cargar el producto"),
            "error",
          );
      })
      .finally(() => setLoading(false));
  }, [id, addToast]);

  function handleDownloadNow() {
    if (id) void descarga.comprar(id);
  }

  async function handleRequestFabricacion() {
    if (!id) return;
    if (materiales.length > 0 && !selectedMaterial) {
      setMaterialError("Elegí el material con el que querés fabricar la pieza");
      return;
    }
    setProcessing("fabricacion");
    try {
      const { compra } = await compraService.crear({
        disenoId: id,
        tipo: "fabricacion",
        material: selectedMaterial || undefined,
      });
      // El pago se hace recién al cerrar el trato con el fabricante.
      navigate(`/product/${id}/fabricantes`, {
        state: {
          compraId: compra.id,
          material: compra.material ?? (selectedMaterial || null),
        },
      });
    } catch (error) {
      addToast(
        getErrorMessage(error, "No se pudo procesar la compra"),
        "error",
      );
      setProcessing(null);
    }
  }

  const purchaseOptions: PurchaseOption[] = [
    {
      icon: <Download size={32} strokeWidth={1.5} />,
      title: "Descargar ahora",
      text: "Comprá el diseño digital y descargalo en tu dispositivo apenas se acredite el pago.",
      steps: [
        "Pagás con Mercado Pago",
        "Se acredita el pago",
        "Descargás el archivo desde Mis compras",
      ],
      buttonTitle: "Descargar ahora",
      buttonVariant: "primary",
      processingKey: "download",
      onClick: handleDownloadNow,
    },
    {
      icon: <Hammer size={32} strokeWidth={1.5} />,
      title: "Solicitar fabricación",
      text: "Comprá el diseño y pedí presupuesto a fabricantes para recibir la pieza impresa en tus manos.",
      steps: [
        "Elegís fabricantes y negociás el precio por chat",
        "Cerrás el trato y pagás con Mercado Pago",
        "Recibís la pieza y confirmás la entrega con un código",
      ],
      buttonTitle: "Solicitar fabricación",
      buttonVariant: "outline",
      processingKey: "fabricacion",
      onClick: handleRequestFabricacion,
      extra:
        materiales.length > 0 ? (
          <FormField
            label="Material"
            name="material"
            type="select"
            value={selectedMaterial}
            onChange={(e) => {
              setMaterial(e.target.value);
              setMaterialError(undefined);
            }}
            options={materiales.map((m) => ({ value: m, label: m }))}
            placeholder="Elegí un material"
            required
            error={materialError}
            hint="Lo usamos para sugerirte fabricantes compatibles."
          />
        ) : undefined,
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
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    );

  // Los planos solo se compran como descarga desde el detalle.
  if (esPlanoTecnico(product.categoria))
    return <Navigate to={`/product/${id}`} replace />;

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

      <div className="purchase-decision__summary">
        <span className="purchase-decision__tecnologia">
          {product.tecnologia}
        </span>
        <MaterialTagList items={product.materiales} />
      </div>

      <div className="purchase-decision__options">
        {purchaseOptions.map((option) => (
          <Card
            key={option.title}
            variant="option"
            className="purchase-decision__option"
            icon={option.icon}
            title={option.title}
            text={option.text}
            list={option.steps}
            footer={
              <Button
                title={option.buttonTitle}
                variant={option.buttonVariant}
                fullWidth
                loading={activePath === option.processingKey}
                disabled={activePath !== null}
                onClick={option.onClick}
              />
            }
          >
            {option.extra}
          </Card>
        ))}
      </div>

      {descarga.pendingCompraId && (
        <div className="purchase-decision__actions">
          <Button
            title="Reintentar pago"
            variant="primary"
            loading={descarga.paying}
            onClick={descarga.reintentarPago}
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
