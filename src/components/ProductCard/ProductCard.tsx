import type { ProductCardProps } from "./ProductCard.types";
import MaterialTagList from "../MaterialTag/MaterialTagList";
import "./ProductCard.css";

const MAX_VISIBLE_MATERIALES = 3;

function formatDownloads(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return n.toString();
}

function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return "$ " + price.toLocaleString("es-AR");
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="product-card__stars"
      aria-label={`${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < filled
              ? "product-card__star product-card__star--filled"
              : "product-card__star"
          }
        >
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

const ProductCard = ({
  imageUrl,
  title,
  description,
  rating,
  downloads,
  price,
  badge,
  tecnologia,
  materiales = [],
  onClick,
  className = "",
}: ProductCardProps) => (
  <article
    className={`product-card${onClick ? " product-card--clickable" : ""}${className ? " " + className : ""}`}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") onClick();
          }
        : undefined
    }
  >
    <div className="product-card__image-wrapper">
      <img className="product-card__image" src={imageUrl} alt={title} />
      <div className="product-card__image-overlay" aria-hidden="true" />
      {badge && <span className="product-card__badge">{badge}</span>}
    </div>

    <div className="product-card__info">
      <h3 className="product-card__title">{title}</h3>
      <p className="product-card__description">{description}</p>

      {(tecnologia || materiales.length > 0) && (
        <div className="product-card__tags">
          {tecnologia && (
            <span className="product-card__tecnologia">{tecnologia}</span>
          )}
          {materiales.length > 0 && (
            <MaterialTagList
              items={materiales}
              max={MAX_VISIBLE_MATERIALES}
              size="sm"
            />
          )}
        </div>
      )}

      <div className="product-card__rating">
        <Stars rating={rating} />
        <span className="product-card__rating-value">{rating.toFixed(1)}</span>
      </div>

      <div className="product-card__footer">
        <span className="product-card__downloads">
          ↓ {formatDownloads(downloads)}
        </span>
        <span
          className={`product-card__price${price === 0 ? " product-card__price--free" : ""}`}
        >
          {formatPrice(price)}
        </span>
      </div>
    </div>
  </article>
);

export default ProductCard;
