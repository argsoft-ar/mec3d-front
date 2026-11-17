import type { ReactNode } from "react";

export interface SpecGridItem {
  /** Nombre de la característica */
  label: string;
  /** Valor como texto plano o componente (p. ej. chips de material) */
  value: ReactNode;
  /** Ícono opcional junto al nombre */
  icon?: ReactNode;
}

export interface SpecGridProps {
  /** Características a listar, en orden */
  items: SpecGridItem[];
  /** Texto para valores vacíos */
  emptyValue?: string;
  /** Columnas en escritorio */
  size?: "small" | "medium" | "large";
  /** Variante visual de cada celda */
  variant?: "spec" | "flat";
  /** Clase CSS adicional */
  className?: string;
}
