import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  Box,
  Ruler,
  Gauge,
  Clock,
  Wrench,
  SlidersHorizontal,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import DesignerHeroCard from "../../components/DesignerHeroCard/DesignerHeroCard";
import MaterialTagList from "../../components/MaterialTag/MaterialTagList";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../hooks/useToast";
import { useCompraDescarga } from "../../hooks/useCompraDescarga";
import { productService } from "../../services/product.service";
import { getErrorMessage, isNotFoundError } from "../../services/http.client";
import { esPlanoTecnico, formatPrintHours } from "../../utils/product.util";
import type { Product } from "../../interfaces/product.interface";
import type { ButtonVariant } from "../../types";
import PageLoader from "../../components/PageLoader/PageLoader";
import "./DetailProduct.css";

type ActionId = "buy" | "preview";

interface ActionItem {
  id: ActionId;
  title: string;
  icon: ReactNode;
  variant: ButtonVariant;
}
const ACTIONS: ActionItem[] = [
  {
    id: "buy",
    title: "Comprar ahora",
    icon: <ShoppingCart size={18} strokeWidth={2} />,
    variant: "primary",
  },
  {
    id: "preview",
    title: "Vista previa 3D",
    icon: <Eye size={18} strokeWidth={2} />,
    variant: "outline",
  },
];

interface SpecItem {
  Icon: LucideIcon;
  title: string;
  value: ReactNode;
}

interface StarProps {
  rating: number;
}

function Stars({ rating }: StarProps) {
  const filled = Math.round(rating);
  return (
    <span
      className="detail-product__stars"
      aria-label={`${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < filled
              ? "detail-product__star detail-product__star--filled"
              : "detail-product__star detail-product__star--empty"
          }
        >
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function formatDownloads(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    : String(n);
}

function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return "$ " + price.toLocaleString("es-AR");
}

function DetailProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const { toasts, addToast, removeToast } = useToast();
  const descarga = useCompraDescarga(addToast);

  useEffect(() => {
    if (!id) return;
    productService
      .getById(id)
      .then((found) => {
        setErrorMessage(null);
        setProduct(found);
      })
      .catch((error: unknown) => {
        setProduct(null);
        setErrorMessage(
          isNotFoundError(error)
            ? "Producto no encontrado."
            : getErrorMessage(error, "No se pudo cargar el producto"),
        );
      })
      .finally(() => setLoading(false));
    // Solo para las estadísticas del diseñador; si falla, se muestran con el producto actual.
    productService
      .getAll({ limit: 100 })
      .then((res) => setAllProducts(res.data))
      .catch(() => setAllProducts([]));
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
        <p className="detail-product__message">
          {errorMessage ?? "Producto no encontrado."}
        </p>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    );

  const designerProducts = allProducts.filter(
    (p) => p.designer.name === product.designer.name,
  );
  const totalDownloads = designerProducts.reduce(
    (sum, p) => sum + p.downloads,
    0,
  );
  const avgRating =
    designerProducts.length > 0
      ? designerProducts.reduce((sum, p) => sum + p.rating, 0) /
        designerProducts.length
      : product.rating;

  const esPlano = esPlanoTecnico(product.categoria);
  const actions = esPlano ? ACTIONS.filter((a) => a.id === "buy") : ACTIONS;

  const handleAction = (actionId: ActionId) => {
    if (actionId === "preview") navigate(`/product/${id}/preview`);
    // Los planos solo admiten descarga: se compra directo, sin pantalla de decisión.
    else if (esPlano) void descarga.comprar(product.id);
    else navigate(`/product/${id}/purchase`);
  };

  const specItems: SpecItem[] = [];
  if (product.tecnologia) {
    specItems.push({
      Icon: Cpu,
      title: "Tecnología",
      value: <span>{product.tecnologia}</span>,
    });
  }
  if (product.materiales?.length > 0) {
    specItems.push({
      Icon: Box,
      title: "Materiales",
      value: <MaterialTagList items={product.materiales} />,
    });
  }
  if (product.specs) {
    const {
      dimensiones,
      dificultad,
      tiempoImpresion,
      soportes,
      configuracion,
    } = product.specs;
    specItems.push(
      { Icon: Ruler, title: "Dimensiones", value: <span>{dimensiones}</span> },
      { Icon: Gauge, title: "Dificultad", value: <span>{dificultad}</span> },
      {
        Icon: Clock,
        title: "Tiempo de Impresión",
        value: <span>{formatPrintHours(tiempoImpresion)}</span>,
      },
      { Icon: Wrench, title: "Soportes", value: <span>{soportes}</span> },
      {
        Icon: SlidersHorizontal,
        title: "Configuración",
        value: (
          <span>{`Layer: ${configuracion.layer} · Infill: ${configuracion.infill}`}</span>
        ),
      },
    );
  }

  return (
    <Layout>
      <div className="detail-product">
        {/* Hero */}
        <section className="detail-product__hero">
          {/* Left: image */}
          <div className="detail-product__image-wrapper">
            <img
              className="detail-product__image"
              src={product.imageUrl}
              alt={product.title}
            />
          </div>

          {/* Right: info */}
          <div className="detail-product__info">
            <h1 className="detail-product__title">{product.title}</h1>

            {/* Rating */}
            <div className="detail-product__rating-row">
              <Stars rating={product.rating} />
              <span>{product.rating}</span>
              <span>({product.reviewCount} reseñas)</span>
            </div>

            {/* Downloads */}
            <div className="detail-product__downloads">
              <span aria-hidden="true">↓</span>
              <span>{formatDownloads(product.downloads)} descargas</span>
            </div>

            {/* Description */}
            <p className="detail-product__description">{product.description}</p>

            {/* Price + format */}
            <div className="detail-product__price-row">
              <span className="detail-product__price">
                {formatPrice(product.price)}
              </span>
              <span className="detail-product__format-badge">
                {product.format}
              </span>
            </div>

            {/* Actions */}
            <div className="detail-product__actions">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="lg"
                  title={action.title}
                  fullWidth={true}
                  icon={action.icon}
                  iconPosition="left"
                  loading={action.id === "buy" && descarga.processing}
                  disabled={descarga.processing}
                  onClick={() => handleAction(action.id)}
                />
              ))}
            </div>
            {descarga.pendingCompraId && (
              <div className="detail-product__actions">
                <Button
                  title="Reintentar pago"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  loading={descarga.paying}
                  onClick={descarga.reintentarPago}
                />
                <Button
                  title="Ir a Mis Compras"
                  variant="ghost"
                  size="lg"
                  fullWidth={true}
                  onClick={() => navigate("/account/purchases")}
                />
              </div>
            )}
          </div>
        </section>

        {/* Especificaciones Técnicas */}
        {specItems.length > 0 && (
          <section className="detail-product__section">
            <h2 className="detail-product__section-title">
              Especificaciones Técnicas
            </h2>
            <div className="detail-product__specs-grid">
              {specItems.map(({ Icon, title, value }) => (
                <Card
                  key={title}
                  variant="spec"
                  title={title}
                  icon={<Icon size={16} strokeWidth={2} />}
                >
                  {value}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Diseñador */}
        <section className="detail-product__section">
          <h2 className="detail-product__section-title">Diseñador</h2>
          <Card variant="default">
            <DesignerHeroCard
              initials={product.designer.initials}
              name={product.designer.name}
              tagline={product.designer.tagline}
              stats={{
                designs: designerProducts.length,
                downloads: totalDownloads,
                avgRating,
              }}
              onViewProfile={() =>
                navigate(
                  `/profile/${encodeURIComponent(product.designer.name)}`,
                )
              }
            />
          </Card>
        </section>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default DetailProduct;
