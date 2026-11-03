import type { ZonaFiltro } from "../../interfaces";

/** Códigos Georef elegidos por nivel; se combinan con OR. */
export type ZonaFilterValue = ZonaFiltro;

export interface ZonaFilterProps {
  /** Zonas seleccionadas */
  value: ZonaFilterValue;
  /** Notifica la nueva selección (ya sin hijos huérfanos) */
  onChange: (value: ZonaFilterValue) => void;
  /** Deshabilita la edición del filtro */
  disabled?: boolean;
  /** Título del filtro */
  title?: string;
  /** Tamaño del filtro */
  size?: "small" | "medium" | "large";
  /** Variante visual */
  variant?: "outlined" | "flat";
  /** Clase CSS adicional */
  className?: string;
}
