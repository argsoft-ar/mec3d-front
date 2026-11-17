import { cacheGet, cacheSet } from "../services/cache";
import { getCurrentUserRole } from "../services/session";

const ADMIN_DENIED_KEY = "admin:denied";
const ADMIN_DENIED_TTL = 60 * 60 * 1000;

/** El rol viaja en `auth_user.rolPrincipal`; un 403 del backend manda sobre ese dato local. */
export function puedeVerAdmin(): boolean {
  return (
    getCurrentUserRole() === "admin" &&
    cacheGet<boolean>(ADMIN_DENIED_KEY) !== true
  );
}

/** Se invoca ante un 403 de /admin/*: oculta el link y bloquea la ruta hasta cerrar sesión. */
export function marcarAdminDenegado(): void {
  cacheSet(ADMIN_DENIED_KEY, true, ADMIN_DENIED_TTL);
}
