export type PurchaseDeliveryStage =
  | "none"
  | "trato_cerrado"
  | "confirmada"
  | "completado";

export interface PurchaseCardProps {
  /** Purchased design thumbnail */
  imageUrl: string;
  /** Design title */
  title: string;
  /** Raw format field; may contain comma-separated extensions (e.g. "STL,3MF") */
  format: string;
  /** Price paid for the purchase */
  pricePaid: number;
  /** Estado de la orden de fabricación ganadora, si el comprador pidió fabricación */
  deliveryStage: PurchaseDeliveryStage;
  /** Disables the download button while a download is in flight */
  downloading?: boolean;
  onDownload: () => void;
  /** Solo se usa cuando deliveryStage === "none" (todavía no se pidió fabricación) */
  onSolicitarFabricacion?: () => void;
  /** Solo se usa cuando deliveryStage === "trato_cerrado" */
  onConfirmarEntrega?: () => void;
  className?: string;
}
