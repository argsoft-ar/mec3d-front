import { Suspense, lazy, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Button from "../../components/Button/Button";
import PageLoader from "../../components/PageLoader/PageLoader";
import { productService } from "../../services/product.service";
import { useArchivoPreview } from "../../hooks/useArchivoPreview";
import type { ArchivoPreviewStatus } from "../../hooks/useArchivoPreview";
import type { Product } from "../../interfaces/product.interface";
import "./ProductPreview3D.css";

const ModelViewer3D = lazy(
  () => import("../../components/ModelViewer3D/ModelViewer3D"),
);

const PREVIEW_MESSAGES: Partial<Record<ArchivoPreviewStatus, string>> = {
  unauthorized: "Iniciá sesión para ver la vista previa 3D.",
  forbidden: "Disponible tras la compra.",
  notFound: "Disponible tras la compra.",
  error: "No se pudo cargar la vista previa 3D. Intentá de nuevo más tarde.",
};

function ProductPreview3D() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const preview = useArchivoPreview(id);

  useEffect(() => {
    productService.getAll().then((res) => {
      setProduct(res.data.find((p) => p.id === id) ?? null);
      setLoading(false);
    });
  }, [id]);

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
          <h1 className="product-preview-3d__title">{product.title}</h1>
        </header>

        <section className="product-preview-3d__viewer">
          {preview.status === "ready" && preview.url ? (
            <Suspense fallback={<PageLoader label="Cargando visor 3D..." />}>
              <ModelViewer3D
                url={preview.url}
                format={product.format}
                className="product-preview-3d__canvas"
                onPreviewError={preview.renovarSiExpiro}
              />
            </Suspense>
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
