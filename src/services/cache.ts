const PREFIX = "mec3d_";
// Claves internas tipo "user:profile" / "georef:provincias": charset cerrado y largo acotado.
const SAFE_KEY = /^[A-Za-z0-9_.:-]{1,100}$/;
const MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRY_LENGTH = 512 * 1024;
const FORBIDDEN_PROPS = new Set(["__proto__", "constructor", "prototype"]);

interface Entry<T> {
  data: T;
  expiresAt: number;
}

/** Clave final en storage, o null si la clave no respeta el charset permitido (se rechaza, no se "limpia"). */
function storageKey(key: string): string | null {
  return typeof key === "string" && SAFE_KEY.test(key) ? PREFIX + key : null;
}

function isEntry(value: unknown): value is Entry<unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const { expiresAt } = value as { expiresAt?: unknown };
  return (
    Object.hasOwn(value, "data") &&
    typeof expiresAt === "number" &&
    Number.isFinite(expiresAt)
  );
}

// Descarta claves de prototype pollution al parsear contenido del storage.
function safeReviver(key: string, value: unknown): unknown {
  return FORBIDDEN_PROPS.has(key) ? undefined : value;
}

export function cacheGet<T>(key: string): T | null {
  const storeKey = storageKey(key);
  if (storeKey === null) return null;
  try {
    const raw = sessionStorage.getItem(storeKey);
    if (!raw) return null;
    let entry: unknown;
    try {
      entry =
        raw.length <= MAX_ENTRY_LENGTH ? JSON.parse(raw, safeReviver) : null;
    } catch {
      entry = null;
    }
    const now = Date.now();
    // Entrada corrupta, manipulada (expiresAt fuera del TTL maximo) o vencida: se elimina.
    if (
      !isEntry(entry) ||
      now > entry.expiresAt ||
      entry.expiresAt > now + MAX_TTL_MS
    ) {
      sessionStorage.removeItem(storeKey);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  const storeKey = storageKey(key);
  if (
    storeKey === null ||
    data === undefined ||
    typeof data === "function" ||
    !Number.isFinite(ttlMs) ||
    ttlMs <= 0
  )
    return;
  try {
    const serialized = JSON.stringify({
      data,
      expiresAt: Date.now() + Math.min(ttlMs, MAX_TTL_MS),
    } satisfies Entry<T>);
    if (serialized.length > MAX_ENTRY_LENGTH) return;
    sessionStorage.setItem(storeKey, serialized);
  } catch {
    // storage quota exceeded, private browsing o dato no serializable
  }
}

export function cacheDel(key: string): void {
  const storeKey = storageKey(key);
  if (storeKey === null) return;
  try {
    sessionStorage.removeItem(storeKey);
  } catch {
    // storage quota exceeded or private browsing
  }
}

/** Borra todas las entradas de la app (p. ej. perfil) al cerrar sesión. */
export function cacheClear(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // private browsing
  }
}
