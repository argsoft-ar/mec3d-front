import { Suspense, lazy, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Button from "../../components/Button/Button";
import PageLoader from "../../components/PageLoader/PageLoader";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import "./ProductPreview3D.css";

const ModelViewer3D = lazy(
  () => import("../../components/ModelViewer3D/ModelViewer3D"),
);

function ProductPreview3D() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
          {product.archivoUrl ? (
            <Suspense fallback={<PageLoader label="Cargando visor 3D..." />}>
              <ModelViewer3D
                url={product.archivoUrl}
                format={product.format}
                className="product-preview-3d__canvas"
              />
            </Suspense>
          ) : (
            <p className="product-preview-3d__no-file">
              No hay archivo 3D disponible para este producto.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default ProductPreview3D;
