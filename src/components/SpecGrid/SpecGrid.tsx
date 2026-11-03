import Card from "../Card/Card";
import type { SpecGridProps } from "./SpecGrid.types";
import "./SpecGrid.css";

function isEmpty(value: SpecGridProps["items"][number]["value"]): boolean {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "")
  );
}

function SpecGrid({
  items,
  emptyValue = "—",
  size = "medium",
  variant = "spec",
  className = "",
}: Readonly<SpecGridProps>) {
  return (
    <div
      className={`spec-grid spec-grid--${size} ${className}`.trim()}
      role="list"
    >
      {items.map(({ label, value, icon }) => (
        <div key={label} role="listitem" className="spec-grid__item">
          <Card variant={variant} title={label} icon={icon}>
            {isEmpty(value) ? (
              <span className="spec-grid__empty">{emptyValue}</span>
            ) : typeof value === "string" || typeof value === "number" ? (
              <span className="spec-grid__value">{value}</span>
            ) : (
              value
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}

export default SpecGrid;
