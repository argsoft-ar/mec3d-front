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
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import DesignerHeroCard from "../../components/DesignerHeroCard/DesignerHeroCard";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import type { ButtonVariant } from "../../types";
import "./DetailProduct.css";

interface ActionItem {
  title: string;
  icon: ReactNode;
  variant: ButtonVariant;
}
const ACTIONS: ActionItem[] = [
  {
    title: "Comprar ahora",
    icon: <ShoppingCart size={18} strokeWidth={2} />,
    variant: "primary",
  },
  {
    title: "Vista previa 3D",
    icon: <Eye size={18} strokeWidth={2} />,
    variant: "outline",
  },
];

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAll().then((products) => {
      setAllProducts(products);
      setProduct(products.find((p) => p.id === id) ?? null);
      setLoading(false);
    });
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <p style={{ padding: "2rem" }}>
          {loading ? "Cargando..." : "Producto no encontrado."}
        </p>
      </Layout>
    );
  }

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
              {ACTIONS.map((action) => (
                <Button
                  key={action.title}
                  variant={action.variant}
                  size="lg"
                  title={action.title}
                  fullWidth={true}
                  icon={action.icon}
                  iconPosition="left"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Especificaciones Técnicas */}
        <section className="detail-product__section">
          <h2 className="detail-product__section-title">
            Especificaciones Técnicas
          </h2>
          <div className="detail-product__specs-grid">
            {product.specs &&
              (() => {
                const {
                  material,
                  dimensiones,
                  dificultad,
                  tiempoImpresion,
                  soportes,
                  configuracion,
                } = product.specs;
                const items = [
                  { Icon: Box, title: "Material", value: material },
                  { Icon: Ruler, title: "Dimensiones", value: dimensiones },
                  { Icon: Gauge, title: "Dificultad", value: dificultad },
                  {
                    Icon: Clock,
                    title: "Tiempo de Impresión",
                    value: tiempoImpresion,
                  },
                  { Icon: Wrench, title: "Soportes", value: soportes },
                  {
                    Icon: SlidersHorizontal,
                    title: "Configuración",
                    value: `Layer: ${configuracion.layer} · Infill: ${configuracion.infill}`,
                  },
                ];
                return items.map(({ Icon, title, value }) => (
                  <Card
                    key={title}
                    variant="spec"
                    title={title}
                    icon={<Icon size={16} strokeWidth={2} />}
                  >
                    <span>{value}</span>
                  </Card>
                ));
              })()}
          </div>
        </section>

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
    </Layout>
  );
}

export default DetailProduct;
