import { createContext } from "react";
import type { NotificacionesContextValue } from "../interfaces";

export const NotificacionesContext =
  createContext<NotificacionesContextValue | null>(null);

// Valor sin sesión (provider no montado): contadores en cero y acciones inertes.
export const NOTIFICACIONES_INACTIVAS: NotificacionesContextValue = {
  totalNoLeidos: 0,
  noLeidosPorConversacion: {},
  conversacionActiva: null,
  setConversacionActiva: () => {},
  marcarConversacionLeida: () => Promise.resolve(),
  sincronizarNoLeidos: () => {},
  refrescarTotal: () => Promise.resolve(),
  ultimoEventoConversacion: null,
};
