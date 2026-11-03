export interface YaCompradoNoticeProps {
  /** Compra de descarga ya pagada del diseño */
  compraId: string;
  /** Dispara la descarga del archivo de la compra */
  onDescargar: (compraId: string) => void;
  /** Descarga en curso: el botón queda en carga */
  descargando?: boolean;
  /** Muestra el botón "Descargar" (false en flujos solo de fabricación) */
  mostrarDescarga?: boolean;
  /** Ruta de la página de compras del usuario */
  comprasPath?: string;
  /** Tamaño del aviso */
  size?: "small" | "medium" | "large";
  /** Variante visual */
  variant?: "success" | "outlined";
  /** Clase CSS adicional */
  className?: string;
}
