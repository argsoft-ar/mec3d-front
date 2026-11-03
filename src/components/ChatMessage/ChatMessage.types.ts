import type { ReactNode } from "react";

export interface ChatMessageAction {
  /** Texto del botón */
  label: string;
  /** Ícono opcional del botón */
  icon?: ReactNode;
  /** Acción al presionar */
  onClick: () => void;
}

export interface ChatMessageProps {
  /** Texto del mensaje; se muestra como texto plano */
  content: string;
  /** Tamaño tipográfico */
  size?: "small" | "medium";
  /** own: propio, other: contraparte, system: aviso del sistema, proposal: propuesta de precio */
  variant?: "own" | "other" | "system" | "proposal";
  /** Acción opcional mostrada debajo del texto */
  action?: ChatMessageAction;
  /** Clase CSS adicional */
  className?: string;
}
