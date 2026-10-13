import type { OrdenFabricacionListItem } from "../../interfaces";

export interface SolicitudFabricacionCardProps {
  orden: OrdenFabricacionListItem;
  downloading: boolean;
  onDescargar: () => void;
  onConfirmarEntrega: () => void;
  onAbrirChat: () => void;
  /** Solo se muestra mientras la orden admite cancelación (antes de declararse la entrega). */
  onCancelar?: () => void;
}
