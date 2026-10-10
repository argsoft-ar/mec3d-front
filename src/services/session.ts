import { cacheClear } from "./cache";

const clearListeners = new Set<() => void>();

/** Permite que módulos con estado en memoria (p. ej. el socket) se limpien junto con la sesión. */
export function onSessionCleared(listener: () => void): void {
  clearListeners.add(listener);
}

/** Elimina credenciales, cache del usuario y estado en memoria asociado a la sesión. */
export function clearSessionData(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  cacheClear();
  clearListeners.forEach((listener) => listener());
}
