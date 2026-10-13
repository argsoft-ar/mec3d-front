import type { TagVariant } from "../../types";
import "./MaterialTag.css";

interface MaterialTagProps {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Color semántico; "primary" es el estilo histórico de las etiquetas de material. */
  variant?: TagVariant;
}

export default function MaterialTag({
  label,
  onRemove,
  disabled,
  size = "md",
  variant = "primary",
}: Readonly<MaterialTagProps>) {
  return (
    <span
      className={`material-tag material-tag--${size} material-tag--${variant}`}
    >
      {label}
      {onRemove && (
        <button
          className="material-tag__remove"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar ${label}`}
          type="button"
        >
          &times;
        </button>
      )}
    </span>
  );
}
