export type EstadoProducto = "disponible" | "vendido" | "pausado";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Diseno {
  id: string;
  disenador_id: string;
  titulo: string;
  categoria_id: number | null;
  archivo_url: string;
  precio_base: number;
  creado_en: string;
}

export interface ProductoFisico {
  id: string;
  fabricante_id: string;
  diseno_id: string;
  precio_final: number;
  estado: EstadoProducto;
  creado_en: string;
}

export interface ProductSpecificaciones {
  material: string;
  dimensiones: string;
  dificultad: string;
  tiempoImpresion: string;
  soportes: string;
  configuracion: {
    layer: string;
    infill: string;
  };
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
  categoria?: string;
  specs: ProductSpecificaciones | null;
  designer: ProductDesigner;
}

export interface CreateProductPayload {
  disenadorId?: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  archivoUrl: string;
  precioBase: number;
  formato: string;
  categoria?: string;
  especificaciones?: ProductSpecificaciones;
}

export type UpdateProductPayload = CreateProductPayload;
export type PartialUpdateProductPayload = Partial<CreateProductPayload>;
