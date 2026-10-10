export interface ArchivoPreviewResponse {
  /** URL firmada de vida corta. */
  url: string;
  /** Segundos de vigencia; null si la URL no expira. */
  expiresIn: number | null;
}

export type EstadoProducto = "disponible" | "vendido" | "pausado";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Diseno {
  id: string;
  disenadorId: string;
  titulo: string;
  categoriaId: number | null;
  archivoUrl: string;
  precioBase: number;
  creadoEn: string;
}

export interface ProductoFisico {
  id: string;
  fabricanteId: string;
  disenoId: string;
  precioFinal: number;
  estado: EstadoProducto;
  creadoEn: string;
}

export interface ProductSpecificaciones {
  dimensiones: string;
  dificultad: string;
  /** Horas enteras (1-500). */
  tiempoImpresion: number;
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
  zonaId?: number | null;
}

export interface Product {
  id: string;
  designerId: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  price: number;
  format: string;
  /** Solo viene en GET /productos/mis-disenos (diseñador dueño); nunca en lecturas públicas. */
  archivoUrl?: string;
  categoria?: string;
  tecnologia: string;
  materiales: string[];
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
  tecnologia: string;
  materiales: string[];
  especificaciones?: ProductSpecificaciones;
}

export type UpdateProductPayload = CreateProductPayload;
export type PartialUpdateProductPayload = Partial<CreateProductPayload>;
