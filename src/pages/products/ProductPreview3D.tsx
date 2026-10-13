import { Suspense, lazy, useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Button from "../../components/Button/Button";
import PageLoader from "../../components/PageLoader/PageLoader";
import ToastContainer from "../../components/Toast/ToastContainer";
import Watermark from "../../components/Watermark/Watermark";
import { productService } from "../../services/product.service";
import { getErrorMessage, isNotFoundError } from "../../services/http.client";
import { useToast } from "../../hooks/useToast";
import { usePreview3D } from "../../hooks/usePreview3D";
import { esPlanoTecnico } from "../../utils/product.util";
import type { Preview3DStatus } from "../../hooks/usePreview3D";
import type { Product } from "../../interfaces/product.interface";
import "./ProductPreview3D.css";

const ModelViewer3D = lazy(
  () => import("../../components/ModelViewer3D/ModelViewer3D"),
);

const WATERMARK_TEXT = "MEC3D · VISTA PREVIA";
const DEGRADED_NOTICE =
  "Vista previa de baja calidad. Comprá el diseño para acceder al archivo original.";
const DEGRADED_VIEWER_ERROR =
  "No se pudo mostrar la vista previa. Comprá el diseño para acceder al archivo original.";

const PREVIEW_MESSAGES: Partial<Record<Preview3DStatus, string>> = {
  notFound: "La vista previa de este diseño todavía no está disponible.",
  rateLimited: "Demasiadas solicitudes, intentá en unos minutos.",
  error: "No se pudo cargar la vista previa 3D. Intentá de nuevo más tarde.",
};

function ProductPreview3D() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // No se pide el archivo hasta confirmar que el producto existe y admite vista previa 3D.
  const previewId =
    product && !esPlanoTecnico(product.categoria) ? id : undefined;
  const preview = usePreview3D(previewId);
  const { toasts, addToast, removeToast } = useToast();

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

  // PDF/DWG/DXF no tienen vista previa 3D.
  if (esPlanoTecnico(product.categoria))
    return <Navigate to={`/product/${id}`} replace />;

  return (
    <Layout>
      <div className="product-preview-3d">
        <header className="product-preview-3d__header">
          <Button
            title="Volver"
            icon={<ArrowLeft size={18} strokeWidth={2} />}
            iconPosition="left"
            variant="ghost"
            onClick={() => navigate(`/product/${id}`)}
          />
          <div className="product-preview-3d__heading">
            <h1 className="product-preview-3d__title">{product.title}</h1>
            {preview.degradado && preview.status === "ready" && (
              <p role="status" className="product-preview-3d__notice">
                {DEGRADED_NOTICE}
              </p>
            )}
          </div>
        </header>

        <section className="product-preview-3d__viewer">
          {preview.status === "ready" && preview.url ? (
            <>
              <Suspense fallback={<PageLoader label="Cargando visor 3D..." />}>
                <ModelViewer3D
                  url={preview.url}
                  format={preview.format ?? product.format}
                  className="product-preview-3d__canvas"
                  onPreviewError={preview.renovarSiExpiro}
                  errorMessage={
                    preview.degradado ? DEGRADED_VIEWER_ERROR : undefined
                  }
                />
              </Suspense>
              {preview.degradado && <Watermark text={WATERMARK_TEXT} />}
            </>
          ) : preview.status === "loading" || preview.status === "idle" ? (
            <PageLoader label="Cargando visor 3D..." />
          ) : (
            <p className="product-preview-3d__no-file">
              {PREVIEW_MESSAGES[preview.status]}
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default ProductPreview3D;
