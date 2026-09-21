import type { OrdenFabricacionListItem } from "../../interfaces";

export interface SolicitudFabricacionCardProps {
  orden: OrdenFabricacionListItem;
  downloading: boolean;
  onDescargar: () => void;
  onConfirmarEntrega: () => void;
  onAbrirChat: () => void;
}
