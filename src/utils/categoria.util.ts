import {
  Car,
  Bike,
  Sailboat,
  House,
  Settings2,
  Cog,
  DraftingCompass,
  Package,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import type { SelectOption } from "../types";

// `nombre` debe coincidir exactamente con las categorías aceptadas por el backend.
export const CATEGORIAS = [
  {
    nombre: "Autos",
    etiqueta: "Autos",
    descripcion: "Piezas y repuestos para automóviles",
    icon: Car,
  },
  {
    nombre: "Motos",
    etiqueta: "Motos",
    descripcion: "Componentes y accesorios para motos",
    icon: Bike,
  },
  {
    nombre: "Barcos",
    etiqueta: "Barcos",
    descripcion: "Partes náuticas y marinas",
    icon: Sailboat,
  },
  {
    nombre: "Casa",
    etiqueta: "Casa",
    descripcion: "Herrajes, cerraduras y más",
    icon: House,
  },
  {
    nombre: "Maquinas",
    etiqueta: "Máquinas",
    descripcion: "Piezas industriales y de producción",
    icon: Settings2,
  },
  {
    nombre: "Engranajes",
    etiqueta: "Engranajes",
    descripcion: "Transmisiones, poleas y sistemas mecánicos",
    icon: Cog,
  },
  {
    nombre: "Envases",
    etiqueta: "Envases",
    descripcion: "Tapas, frascos, botellas y contenedores",
    icon: Package,
  },
  {
    nombre: "Piezas varias",
    etiqueta: "Piezas varias",
    descripcion: "Repuestos y piezas que no encajan en otra categoría",
    icon: Shapes,
  },
  {
    nombre: "Planos técnicos",
    etiqueta: "Planos técnicos",
    descripcion: "Planos en PDF, DWG y DXF para descargar",
    icon: DraftingCompass,
  },
] as const satisfies readonly {
  nombre: string;
  etiqueta: string;
  descripcion: string;
  icon: LucideIcon;
}[];

export type Categoria = (typeof CATEGORIAS)[number];
export type ProductCategory = Categoria["nombre"];

export const CATEGORIA_OPTIONS: SelectOption[] = CATEGORIAS.map((c) => ({
  value: c.nombre,
  label: c.etiqueta,
}));
