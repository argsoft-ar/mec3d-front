import type {
  CreateProductPayload,
  FormatoPlano,
  ProductForm,
  ProductFormRules,
} from "../interfaces";
import type { SelectOption } from "../types";

// Límites espejo de mec3d-back/src/schemas/diseno.schema.ts.
export const MIN_PRINT_HOURS = 1;
export const MAX_PRINT_HOURS = 500;
export const MIN_PRECIO_BASE = 0.01;
export const MAX_PRECIO_BASE = 10_000_000;
export const MAX_MATERIALES_POR_DISENO = 20;

export function formatPrintHours(hours: number): string {
  return `${hours} h`;
}

// Espejo de mec3d-back/src/utils/plano.util.ts y upload.middleware.ts.
export const CATEGORIA_PLANOS_TECNICOS = "Planos técnicos" as const;
export const FORMATOS_PLANO: readonly FormatoPlano[] = ["PDF", "DWG", "DXF"];
const PLANO_EXTENSIONS = [".pdf", ".dwg", ".dxf"] as const;
const MODELO_EXTENSIONS = [".stl", ".3mf", ".obj", ".step", ".stp"] as const;
const MAX_PLANO_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_MODELO_SIZE_BYTES = 10 * 1024 * 1024;

export function esPlanoTecnico(categoria: string | null | undefined): boolean {
  return (
    typeof categoria === "string" &&
    categoria.trim().toLowerCase() === CATEGORIA_PLANOS_TECNICOS.toLowerCase()
  );
}

export function isFormatoPlano(value: string): value is FormatoPlano {
  return (FORMATOS_PLANO as readonly string[]).includes(value);
}

/** Extensión en minúsculas y con punto, ignorando query string o hash de una URL; "" si no tiene. */
export function getFileExtension(nameOrUrl: string): string {
  const path = nameOrUrl.split(/[?#]/)[0];
  const dot = path.lastIndexOf(".");
  if (dot === -1 || path.includes("/", dot)) return "";
  return path.slice(dot).toLowerCase();
}

const MODELO_FORMAT_OPTIONS: SelectOption[] = [
  { value: "STL", label: "STL" },
  { value: "3MF", label: "3MF" },
  { value: "CNC", label: "CNC" },
];

const PLANO_FORMAT_OPTIONS: SelectOption[] = FORMATOS_PLANO.map((f) => ({
  value: f,
  label: f,
}));

const MODELO_FORM_RULES: ProductFormRules = {
  esPlano: false,
  showTechnicalFields: true,
  formatOptions: MODELO_FORMAT_OPTIONS,
  archivo: {
    label: "Archivo de diseño 3D",
    accept: MODELO_EXTENSIONS.join(","),
    hint: "Formatos permitidos: STL, 3MF, OBJ, STEP (máx. 10MB)",
    extensions: MODELO_EXTENSIONS,
    maxBytes: MAX_MODELO_SIZE_BYTES,
    missingMessage: "Subí el archivo de diseño 3D",
    invalidFormatMessage: "Formato no permitido. Usá STL, 3MF, OBJ, STEP o STP",
    tooLargeMessage: "El archivo debe ser menor a 10MB",
    uploadErrorMessage: "Error al subir el archivo 3D",
  },
};

const PLANO_FORM_RULES: ProductFormRules = {
  esPlano: true,
  showTechnicalFields: false,
  formatOptions: PLANO_FORMAT_OPTIONS,
  archivo: {
    label: "Archivo del plano",
    accept: PLANO_EXTENSIONS.join(","),
    hint: "Formatos permitidos: PDF, DWG, DXF (máx. 5MB)",
    extensions: PLANO_EXTENSIONS,
    maxBytes: MAX_PLANO_SIZE_BYTES,
    missingMessage: "Subí el archivo del plano",
    invalidFormatMessage: "Formato no permitido. Usá PDF, DWG o DXF",
    tooLargeMessage: "El plano debe ser menor a 5MB",
    uploadErrorMessage: "Error al subir el archivo del plano",
  },
};

export function getProductFormRules(categoria: string): ProductFormRules {
  return esPlanoTecnico(categoria) ? PLANO_FORM_RULES : MODELO_FORM_RULES;
}

export function buildProductPayload(
  form: ProductForm,
  imagenUrl: string,
  archivoUrl: string,
): CreateProductPayload {
  const base = {
    titulo: form.titulo,
    descripcion: form.descripcion,
    imagenUrl,
    archivoUrl,
    precioBase: Number(form.precioBase),
  };

  if (esPlanoTecnico(form.categoria)) {
    if (!isFormatoPlano(form.formato)) {
      throw new Error("El formato del plano debe ser PDF, DWG o DXF");
    }
    return {
      ...base,
      categoria: CATEGORIA_PLANOS_TECNICOS,
      formato: form.formato,
    };
  }

  return {
    ...base,
    categoria: form.categoria,
    formato: form.formato,
    tecnologia: form.tecnologia,
    materiales: form.materiales,
    especificaciones: {
      dimensiones: form.specDimensiones,
      dificultad: form.specDificultad,
      tiempoImpresion: Number(form.specTiempoImpresion),
      soportes: form.specSoportes,
      configuracion: {
        layer: form.specLayer,
        infill: form.specInfill,
      },
    },
  };
}
