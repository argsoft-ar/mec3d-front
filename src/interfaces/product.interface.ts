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
