import type { SelectOption } from "../types";

export interface ProductForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  precioBase: string;
  formato: string;
  imagenUrl: string;
  archivoUrl: string;
  specMaterial: string;
  specDimensiones: string;
  specDificultad: string;
  specTiempoImpresion: string;
  specSoportes: string;
  specLayer: string;
  specInfill: string;
}

export interface FormFieldConfig {
  label: string;
  name: keyof ProductForm;
  type?: "text" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: SelectOption[];
}

export interface ButtonConfig {
  title: string;
  variant: "ghost" | "primary";
  type: "button" | "submit";
  loading?: boolean;
  onClick?: () => void;
}
