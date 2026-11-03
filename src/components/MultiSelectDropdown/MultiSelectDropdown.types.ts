import type React from "react";
import type { SelectOption } from "../../types";

export interface MultiSelectDropdownProps {
  /** Texto de la etiqueta visible */
  label: string;
  /** Nombre del campo; también se usa para generar los ids */
  name: string;
  /** Opciones disponibles */
  options: SelectOption[];
  /** Valores seleccionados */
  value: string[];
  /** Se invoca con la nueva lista de valores seleccionados */
  onChange: (value: string[]) => void;
  /** Mensaje de error */
  error?: string;
  /** Texto de ayuda debajo del campo */
  hint?: React.ReactNode;
  /** Marca el campo como obligatorio */
  required?: boolean;
  /** Deshabilita el campo */
  disabled?: boolean;
  /** Ocupa todas las columnas del formulario */
  fullWidth?: boolean;
  /** Tope de opciones seleccionables; al alcanzarlo se deshabilitan las restantes */
  maxSelected?: number;
  /** Indica que las opciones se están cargando */
  loading?: boolean;
  /** Texto mostrado cuando no hay opciones disponibles */
  emptyMessage?: string;
  /** Texto del disparador cuando no hay selección */
  placeholder?: string;
  /** Placeholder del buscador */
  searchPlaceholder?: string;
  /** Muestra el buscador dentro del desplegable */
  searchable?: boolean;
  /** Tamaño del disparador */
  size?: "small" | "medium" | "large";
  /** Variante visual del disparador */
  variant?: "outlined" | "filled";
  /** Clase CSS adicional */
  className?: string;
}
