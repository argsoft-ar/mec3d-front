import type { ReactNode } from "react";
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

function renderValue(
  value: SpecGridProps["items"][number]["value"],
  emptyValue: ReactNode,
): ReactNode {
  if (isEmpty(value))
    return <span className="spec-grid__empty">{emptyValue}</span>;
  if (typeof value === "string" || typeof value === "number")
    return <span className="spec-grid__value">{value}</span>;
  return value;
}

function SpecGrid({
  items,
  emptyValue = "—",
  size = "medium",
  variant = "spec",
  className = "",
}: Readonly<SpecGridProps>) {
  return (
    <ul className={`spec-grid spec-grid--${size} ${className}`.trim()}>
      {items.map(({ label, value, icon }) => (
        <li key={label} className="spec-grid__item">
          <Card variant={variant} title={label} icon={icon}>
            {renderValue(value, emptyValue)}
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default SpecGrid;
