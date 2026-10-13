import MaterialTag from "./MaterialTag";
import "./MaterialTagList.css";

interface MaterialTagListProps {
  items: string[];
  /** Cantidad máxima de etiquetas visibles; el resto se resume como "+N". */
  max?: number;
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

export default function MaterialTagList({
  items,
  max,
  size = "md",
  ariaLabel = "Materiales",
  className = "",
}: Readonly<MaterialTagListProps>) {
  const visible = max === undefined ? items : items.slice(0, max);
  const hidden = items.length - visible.length;

  return (
    <ul
      className={`material-tag-list ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {visible.map((item) => (
        <li key={item}>
          <MaterialTag label={item} size={size} />
        </li>
      ))}
      {hidden > 0 && (
        <li title={items.slice(visible.length).join(", ")}>
          <MaterialTag label={`+${hidden}`} size={size} />
        </li>
      )}
    </ul>
  );
}
