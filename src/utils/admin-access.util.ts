import { cacheGet, cacheSet } from "../services/cache";
import type { RolUsuario } from "../interfaces";

const ADMIN_DENIED_KEY = "admin:denied";
const ADMIN_DENIED_TTL = 60 * 60 * 1000;

function getStoredRole(): RolUsuario | null {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return (
      (JSON.parse(raw) as { rolPrincipal?: RolUsuario }).rolPrincipal ?? null
    );
  } catch {
    return null;
  }
}

/** El rol viaja en `auth_user.rolPrincipal`; un 403 del backend manda sobre ese dato local. */
export function puedeVerAdmin(): boolean {
  return (
    getStoredRole() === "admin" && cacheGet<boolean>(ADMIN_DENIED_KEY) !== true
  );
}

/** Se invoca ante un 403 de /admin/*: oculta el link y bloquea la ruta hasta cerrar sesión. */
export function marcarAdminDenegado(): void {
  cacheSet(ADMIN_DENIED_KEY, true, ADMIN_DENIED_TTL);
}
