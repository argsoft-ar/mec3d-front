import { cacheClear } from "./cache";
import type { RolUsuario, UsuarioPublico } from "../interfaces";

/**
 * La sesión real es la cookie HttpOnly `mec3d_session` (JS no la ve). En localStorage solo
 * queda el perfil público del usuario, que la UI necesita de forma síncrona; su presencia
 * es el indicador local de "hay sesión" y se valida al arrancar contra GET /auth/me.
 */
const USER_KEY = "auth_user";
/** JWT que versiones anteriores guardaban en el browser; se purga al arrancar. */
const LEGACY_TOKEN_KEY = "auth_token";

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

export function isUsuarioPublico(value: unknown): value is UsuarioPublico {
  if (typeof value !== "object" || value === null) return false;
  const { id, email, rolPrincipal } = value as Partial<
    Record<keyof UsuarioPublico, unknown>
  >;
  return (
    typeof id === "string" &&
    typeof email === "string" &&
    typeof rolPrincipal === "string"
  );
}

/** Elimina tokens persistidos por versiones anteriores (la sesión ahora vive en la cookie). */
export function purgeLegacyToken(): void {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getCurrentUser(): UsuarioPublico | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isUsuarioPublico(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getCurrentUserRole(): RolUsuario | null {
  return getCurrentUser()?.rolPrincipal ?? null;
}

/** Firma estable (string) del estado de sesión, apta para useSyncExternalStore. */
export function getSessionSnapshot(): string {
  return localStorage.getItem(USER_KEY) ?? "";
}

export function saveSession(user: UsuarioPublico): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

/** Actualiza campos del usuario guardado (p. ej. tras un cambio de rol); no-op sin sesión. */
export function updateCurrentUser(patch: Partial<UsuarioPublico>): void {
  const user = getCurrentUser();
  if (!user) return;
  saveSession({ ...user, ...patch });
}

/** Elimina el perfil local, la cache del usuario y el estado en memoria asociado a la sesión. */
export function clearSessionData(): void {
  localStorage.removeItem(USER_KEY);
  purgeLegacyToken();
  cacheClear();
  clearListeners.forEach((listener) => listener());
  notifySessionChanged();
}
