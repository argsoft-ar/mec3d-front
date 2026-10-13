import type React from "react";
import type { SelectOption } from "../types";

export interface ProductForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  precioBase: string;
  formato: string;
  imagenUrl: string;
  archivoUrl: string;
  tecnologia: string;
  materiales: string[];
  specDimensiones: string;
  specDificultad: string;
  /** Horas enteras como texto del input numérico; se convierte a number al enviar. */
  specTiempoImpresion: string;
  specSoportes: string;
  specLayer: string;
  specInfill: string;
}

/** Claves del formulario cuyo valor es un string (editables con FormField). */
export type ProductFormTextKey = {
  [K in keyof ProductForm]: ProductForm[K] extends string ? K : never;
}[keyof ProductForm];

export type ProductFormErrors = Partial<Record<keyof ProductForm, string>>;

export interface FormFieldConfig {
  label: string;
  name: ProductFormTextKey;
  type?: "text" | "number" | "select" | "textarea" | "file";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: SelectOption[];
  accept?: string;
  hint?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number | "any";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Teclas (KeyboardEvent.key) que el input descarta al escribirse. */
  blockedKeys?: readonly string[];
}

export interface ArchivoRules {
  label: string;
  accept: string;
  hint: string;
  /** Extensiones permitidas, en minúsculas y con punto. */
  extensions: readonly string[];
  maxBytes: number;
  missingMessage: string;
  invalidFormatMessage: string;
  tooLargeMessage: string;
  uploadErrorMessage: string;
}

/** Qué campos, opciones y validaciones aplica el formulario de diseño según la categoría. */
export interface ProductFormRules {
  esPlano: boolean;
  /** Tecnología, materiales y especificaciones de impresión. */
  showTechnicalFields: boolean;
  formatOptions: SelectOption[];
  archivo: ArchivoRules;
}

export interface ButtonConfig {
  title: string;
  variant: "ghost" | "primary";
  type: "button" | "submit";
  loading?: boolean;
  onClick?: () => void;
}
