import type { LucideIcon } from "lucide-react";
import { Box, Ruler, Gauge, Clock, Wrench, SlidersHorizontal, FileText } from "lucide-react";

export interface ProductSpec {
  icon: LucideIcon;
  title: string;
  value: string;
}

export interface ProductDesigner {
  initials: string;
  name: string;
  tagline: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  price: number;
  format: string;
  specs: ProductSpec[];
  designer: ProductDesigner;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Soporte Motor V8",
    description:
      "Soporte de motor de alta resistencia para vehículos de competición. Compatible con bloques V8 estándar, montaje mediante tornillos M8.",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop",
    rating: 4.8,
    reviewCount: 214,
    downloads: 2400,
    price: 1500,
    format: "STL",
    specs: [
      { icon: Box, title: "Material", value: "PETG" },
      { icon: Ruler, title: "Dimensiones", value: "320×180×120 mm" },
      { icon: Gauge, title: "Dificultad", value: "Avanzado" },
      { icon: Clock, title: "Tiempo de Impresión", value: "14h" },
      { icon: Wrench, title: "Soportes", value: "Requeridos" },
      { icon: SlidersHorizontal, title: "Configuración", value: "Layer: 0.15mm · Infill: 40%" },
      { icon: FileText, title: "Licencia", value: "CC BY-NC" },
    ],
    designer: {
      initials: "RL",
      name: "Roberto Lagos",
      tagline: "Ingeniero mecánico especializado en autopartes impresas en 3D",
    },
  },
  {
    id: "2",
    title: "Engranaje Planetario",
    description:
      "Sistema de engranajes planetarios con relación 1:4, imprimible en PLA o PETG. Ideal para proyectos de robótica y automatización.",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=450&fit=crop",
    rating: 4.5,
    reviewCount: 98,
    downloads: 1800,
    price: 800,
    format: "STL",
    specs: [
      { icon: Box, title: "Material", value: "PLA / PETG" },
      { icon: Ruler, title: "Dimensiones", value: "80×80×45 mm" },
      { icon: Gauge, title: "Dificultad", value: "Intermedio" },
      { icon: Clock, title: "Tiempo de Impresión", value: "8h" },
      { icon: Wrench, title: "Soportes", value: "No necesarios" },
      { icon: SlidersHorizontal, title: "Configuración", value: "Layer: 0.2mm · Infill: 30%" },
      { icon: FileText, title: "Licencia", value: "CC BY-SA" },
    ],
    designer: {
      initials: "MG",
      name: "Miguel Gómez",
      tagline: "Diseñador de piezas funcionales para impresión 3D",
    },
  },
  {
    id: "3",
    title: "Soporte CNC Universal",
    description:
      "Adaptador universal para fresadoras CNC, compatible con guías de 20mm. Permite ajuste fino en los tres ejes.",
    imageUrl:
      "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=450&fit=crop",
    rating: 4.2,
    reviewCount: 67,
    downloads: 950,
    price: 0,
    format: "STL",
    specs: [
      { icon: Box, title: "Material", value: "ABS" },
      { icon: Ruler, title: "Dimensiones", value: "120×60×40 mm" },
      { icon: Gauge, title: "Dificultad", value: "Básico" },
      { icon: Clock, title: "Tiempo de Impresión", value: "4h" },
      { icon: Wrench, title: "Soportes", value: "No necesarios" },
      { icon: SlidersHorizontal, title: "Configuración", value: "Layer: 0.2mm · Infill: 25%" },
      { icon: FileText, title: "Licencia", value: "CC BY" },
    ],
    designer: {
      initials: "AC",
      name: "Ana Castro",
      tagline: "Especialista en automatización y fabricación digital",
    },
  },
  {
    id: "4",
    title: "Bisagra Oculta 3D",
    description:
      "Bisagra completamente imprimible para puertas y gabinetes de hasta 2kg. No requiere herrajes adicionales.",
    imageUrl:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=450&fit=crop",
    rating: 3.9,
    reviewCount: 182,
    downloads: 3200,
    price: 200,
    format: "STL",
    specs: [
      { icon: Box, title: "Material", value: "PLA" },
      { icon: Ruler, title: "Dimensiones", value: "50×30×15 mm" },
      { icon: Gauge, title: "Dificultad", value: "Básico" },
      { icon: Clock, title: "Tiempo de Impresión", value: "2h" },
      { icon: Wrench, title: "Soportes", value: "No necesarios" },
      { icon: SlidersHorizontal, title: "Configuración", value: "Layer: 0.2mm · Infill: 20%" },
      { icon: FileText, title: "Licencia", value: "CC BY-SA" },
    ],
    designer: {
      initials: "JP",
      name: "Juan Pérez",
      tagline: "Maker y diseñador de soluciones hogareñas imprimibles",
    },
  },
];
