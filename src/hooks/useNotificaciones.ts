import { useContext } from "react";
import {
  NotificacionesContext,
  NOTIFICACIONES_INACTIVAS,
} from "../context/NotificacionesContext";
import type { NotificacionesContextValue } from "../interfaces";

export function useNotificaciones(): NotificacionesContextValue {
  return useContext(NotificacionesContext) ?? NOTIFICACIONES_INACTIVAS;
}
