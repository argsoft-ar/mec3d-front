import "./MaterialTag.css";

interface MaterialTagProps {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
}

export default function MaterialTag({
  label,
  onRemove,
  disabled,
}: MaterialTagProps) {
  return (
    <span className="material-tag">
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
