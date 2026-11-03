import { cacheClear } from "./cache";
import type { RolUsuario, UsuarioPublico } from "../interfaces";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const clearListeners = new Set<() => void>();
const changeListeners = new Set<() => void>();

/** Permite que módulos con estado en memoria (p. ej. el socket) se limpien junto con la sesión. */
export function onSessionCleared(listener: () => void): void {
  clearListeners.add(listener);
}

/** Notifica login, logout o cambios del usuario guardado; devuelve la desuscripción. */
export function onSessionChanged(listener: () => void): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

export function notifySessionChanged(): void {
  changeListeners.forEach((listener) => listener());
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function getCurrentUser(): UsuarioPublico | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioPublico;
  } catch {
    return null;
  }
}

export function getCurrentUserRole(): RolUsuario | null {
  return getCurrentUser()?.rolPrincipal ?? null;
}

/** Firma estable (string) del estado de sesión, apta para useSyncExternalStore. */
export function getSessionSnapshot(): string {
  return `${getToken() ?? ""}|${localStorage.getItem(USER_KEY) ?? ""}`;
}

export function saveSession(token: string, user: UsuarioPublico): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

/** Elimina credenciales, cache del usuario y estado en memoria asociado a la sesión. */
export function clearSessionData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  cacheClear();
  clearListeners.forEach((listener) => listener());
  notifySessionChanged();
}
