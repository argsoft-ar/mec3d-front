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
/** Tope del perfil serializado: el objeto legítimo ocupa unos pocos cientos de bytes. */
const MAX_STORED_USER_LENGTH = 2048;

/** Allowlist cerrada de roles: el valor persistido es siempre una de estas constantes. */
const ROLES: readonly RolUsuario[] = [
  "comprador",
  "disenador",
  "fabricante",
  "admin",
];
// Los ids de usuario son UUID (gen_random_uuid en el backend).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Email acotado (254) sin espacios, comillas ni <>; dominio ASCII como valida el backend (zod).
const EMAIL_RE = /^[^\s@<>"'`\\]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){1,8}$/;
const MAX_EMAIL_LENGTH = 254;
// Mismos formatos que acepta el backend (policy.util): CBU/CVU, alias o email.
const CBU_CVU_RE = /^\d{22}$/;
const ALIAS_RE = /^[a-zA-Z0-9.-]{6,20}$/;
// zonaId = código INDEC de localidad (hasta 8 dígitos), igual que updateProfileSchema.
const MAX_ZONA_ID = 99_999_999;

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

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_EMAIL_LENGTH &&
    EMAIL_RE.test(value)
  );
}

/** Rol de la allowlist (la constante, no el string recibido) o null. */
function toRol(value: unknown): RolUsuario | null {
  return ROLES.find((rol) => rol === value) ?? null;
}

/** zonaId opcional: ausente o inválido => null (no afecta la identidad de la sesión). */
function toZonaId(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_ZONA_ID
    ? value
    : null;
}

/** cuentaMercadopago opcional: solo CBU/CVU, alias o email válidos; si no, null. */
function toCuentaMercadopago(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (CBU_CVU_RE.test(value) || ALIAS_RE.test(value) || isValidEmail(value))
    return value;
  return null;
}

/**
 * Proyección saneada de `UsuarioPublico`: objeto NUEVO con solo los campos conocidos.
 * Los campos de identidad (id, email, rol) son obligatorios y estrictos: si alguno no
 * valida devuelve null y el llamador no persiste nada. Los campos opcionales inválidos
 * se normalizan a null. Nunca se copian propiedades extra (p. ej. `__proto__`, tokens).
 */
export function sanitizeUsuarioPublico(value: unknown): UsuarioPublico | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const { id, email, rolPrincipal, zonaId, cuentaMercadopago } = value as Partial<
    Record<keyof UsuarioPublico, unknown>
  >;
  if (typeof id !== "string" || !UUID_RE.test(id)) return null;
  if (!isValidEmail(email)) return null;
  const rol = toRol(rolPrincipal);
  if (rol === null) return null;
  return {
    id,
    email,
    rolPrincipal: rol,
    zonaId: toZonaId(zonaId),
    cuentaMercadopago: toCuentaMercadopago(cuentaMercadopago),
  };
}

export function isUsuarioPublico(value: unknown): value is UsuarioPublico {
  return sanitizeUsuarioPublico(value) !== null;
}

/** Elimina tokens persistidos por versiones anteriores (la sesión ahora vive en la cookie). */
export function purgeLegacyToken(): void {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getCurrentUser(): UsuarioPublico | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw.length > MAX_STORED_USER_LENGTH) return null;
  try {
    // Lo leído también se reconstruye: un valor manipulado en el storage no llega a la UI.
    return sanitizeUsuarioPublico(JSON.parse(raw));
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

/**
 * Persiste solo la proyección validada del usuario (nunca el objeto de la respuesta HTTP).
 * Si no valida, no se escribe nada ni se notifica (el estado guardado no cambió).
 */
export function saveSession(user: UsuarioPublico): void {
  const safeUser = sanitizeUsuarioPublico(user);
  if (safeUser === null) return;
  const serialized = JSON.stringify(safeUser);
  if (serialized.length > MAX_STORED_USER_LENGTH) return;
  localStorage.setItem(USER_KEY, serialized);
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