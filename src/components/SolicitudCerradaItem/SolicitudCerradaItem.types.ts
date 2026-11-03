import type { TagVariant } from "../../types";

export interface SolicitudCerradaItemProps {
  /** Título del diseño */
  titulo: string;
  /** URL de la miniatura; si falta se muestra un ícono */
  imagenUrl?: string | null;
  /** Username del comprador, sin "@" */
  compradorUsername?: string | null;
  /** Texto del estado */
  estadoLabel: string;
  /** Color del badge de estado */
  estadoVariant?: TagVariant;
  /** Precio acordado en pesos */
  precio?: number | null;
  /** Fecha ISO a mostrar */
  fecha?: string | null;
  /** Abre el chat; si no se pasa, el botón no se muestra */
  onVerChat?: () => void;
  /** Abre las especificaciones del diseño */
  onVerDiseno?: () => void;
  /** Densidad del ítem */
  size?: "sm" | "md";
  /** Clase CSS adicional */
  className?: string;
}
