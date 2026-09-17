export interface PurchaseCardProps {
  /** Purchased design thumbnail */
  imageUrl: string;
  /** Design title */
  title: string;
  /** Raw format field; may contain comma-separated extensions (e.g. "STL,3MF") */
  format: string;
  /** Price paid for the purchase */
  pricePaid: number;
  /** Whether the escrow delivery was already confirmed */
  entregaConfirmada: boolean;
  /** Disables the download button while a download is in flight */
  downloading?: boolean;
  onDownload: () => void;
  /** Omit to hide the "Confirmar entrega" action */
  onConfirmarEntrega?: () => void;
  className?: string;
}
