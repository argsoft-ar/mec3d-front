import { useState, useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  Box,
  Ruler,
  Gauge,
  Clock,
  Wrench,
  SlidersHorizontal,
  FileText,
  type LucideIcon,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import type { ButtonVariant } from "../../types";
import "./DetailProduct.css";

interface ActionItem {
  title: string;
  icon: ReactNode;
  variant: ButtonVariant;
}
const SPEC_TITLES: string[] = [
  "Material",
  "Dimensiones",
  "Dificultad",
  "Tiempo de Impresión",
  "Soportes",
  "Configuración",
  "Licencia",
];

const SPEC_ICONS: LucideIcon[] = [
  Box,
  Ruler,
  Gauge,
  Clock,
  Wrench,
  SlidersHorizontal,
  FileText,
];

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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    productService.getAll().then((products) => {
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
            {product.specs.map((spec, i) => {
              const Icon = SPEC_ICONS[i];
              const title = SPEC_TITLES[i] ?? spec.title;
              return (
                <Card
                  key={i}
                  variant="spec"
                  title={title}
                  icon={Icon ? <Icon size={16} strokeWidth={2} /> : undefined}
                >
                  <span>{spec.value}</span>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Diseñador */}
        <section className="detail-product__section">
          <h2 className="detail-product__section-title">Diseñador</h2>
          <Card
            variant="default"
            footer={<Button variant="ghost" size="sm" title="Ver perfil" />}
          >
            <div className="detail-product__designer-inner">
              <div className="detail-product__designer-avatar">
                {product.designer.initials}
              </div>
              <div>
                <h4 className="detail-product__designer-name">
                  {product.designer.name}
                </h4>
                <p className="detail-product__designer-tagline">
                  {product.designer.tagline}
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
}

export default DetailProduct;
