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

export interface MultiSelectDropdownPopoverProps {
  id: string;
  listId: string;
  labelId: string;
  /** Nombre de los checkboxes */
  name: string;
  /** Etiqueta del campo, usada en el aria-label del buscador */
  label: string;
  options: SelectOption[];
  /** Opciones filtradas a renderizar */
  visible: SelectOption[];
  value: string[];
  totalMatches: number;
  truncated: boolean;
  limitReached: boolean;
  maxSelected?: number;
  loading: boolean;
  emptyMessage: string;
  searchable: boolean;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  onToggle: (optionValue: string) => void;
  onClear: () => void;
  searchRef: React.Ref<HTMLInputElement>;
  listRef: React.Ref<HTMLFieldSetElement>;
}
