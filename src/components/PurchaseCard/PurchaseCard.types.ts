import type { EstadoCompra, TipoCompra } from "../../interfaces";

export type PurchaseDeliveryStage =
  | "none"
  | "trato_cerrado"
  | "confirmada"
  | "en_disputa"
  | "completado";

export interface PurchaseCardProps {
  /** Purchased design thumbnail */
  imageUrl: string;
  /** Design title */
  title: string;
  /** Raw format field; may contain comma-separated extensions (e.g. "STL,3MF") */
  format: string;
  /** Material elegido por el comprador, si lo hubo */
  material?: string | null;
  /** Precio en pesos; null mientras la fabricación no tiene precio acordado */
  pricePaid: number | null;
  /** "descarga" habilita bajar el archivo; "fabricacion" sigue el flujo de cotización/entrega */
  tipo: TipoCompra;
  /** Estado de pago de la compra */
  estadoCompra: EstadoCompra;
  /** Estado de la orden de fabricación ganadora, si el comprador pidió fabricación */
  deliveryStage: PurchaseDeliveryStage;
  /** Disables the download button while a download is in flight */
  downloading?: boolean;
  /** Muestra el botón de pago en curso mientras se abre el checkout */
  paying?: boolean;
  /** Solo se usa con tipo === "descarga" y la compra pagada */
  onDownload?: () => void;
  /** Solo se usa con la compra pendiente de pago */
  onPagar?: () => void;
  /** Solo se usa con tipo === "fabricacion" y deliveryStage === "none" */
  onSolicitarFabricacion?: () => void;
  /** Solo se usa cuando deliveryStage === "trato_cerrado" y la compra está pagada */
  onConfirmarEntrega?: () => void;
  /** Solo se usa cuando deliveryStage === "trato_cerrado" o "confirmada" y la compra está pagada */
  onGenerarCodigo?: () => void;
  /** Solo se usa cuando deliveryStage === "trato_cerrado" o "confirmada" y la compra está pagada */
  onAbrirDisputa?: () => void;
  className?: string;
}
