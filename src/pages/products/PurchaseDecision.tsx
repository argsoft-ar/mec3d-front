import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useCheckout } from "../../hooks/useCheckout";
import { compraService } from "../../services/compra.service";
import { getErrorMessage } from "../../services/http.client";
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
  // Compra de descarga creada cuyo checkout no pudo abrirse; se puede reintentar el pago.
  const [pendingCompraId, setPendingCompraId] = useState<string | null>(null);
  const { paying, redirigir, pagar } = useCheckout(addToast);
  const [material, setMaterial] = useState("");
  const [materialError, setMaterialError] = useState<string | undefined>();

  const materiales = product?.materiales ?? [];
  // Con un único material posible no hay nada que elegir.
  const selectedMaterial =
    material || (materiales.length === 1 ? materiales[0] : "");

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
      const { compra, initPoint } = await compraService.crear({
        disenoId: id,
        tipo: "descarga",
      });
      // Si se redirige, la página se descarga: el botón queda en carga hasta entonces.
      if (!redirigir(initPoint)) {
        setPendingCompraId(compra.id);
        setProcessing(null);
      }
    } catch (error) {
      addToast(
        getErrorMessage(
          error,
          "No se pudo procesar la compra. Si ya se creó, pagala desde Mis compras.",
        ),
        "error",
      );
      setProcessing(null);
    }
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
                loading={processing === option.processingKey}
                disabled={processing !== null}
                onClick={option.onClick}
              />
            }
          >
            {option.extra}
          </Card>
        ))}
      </div>

      {pendingCompraId && (
        <div className="purchase-decision__actions">
          <Button
            title="Reintentar pago"
            variant="primary"
            loading={paying}
            onClick={() => pagar(pendingCompraId)}
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
